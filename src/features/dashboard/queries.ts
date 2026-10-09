'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAppContext, useGroupMembers } from '@/features/common/queries'
import { applyPendingExpenses, usePendingExpenseWrites } from '@/lib/query/mutations'
import { todayDate } from './dates'
import { budgetSummary, memberSpend, budgetCategoryUsage, latestSpendDate, spendDay, type BudgetRow, type ExpRow, type BCRow } from './derive'
import type { SpendDay } from './types'

const EXPENSE_SELECT = '*, profiles(display_name, avatar_color), categories(name, icon, color, bg_color)'

const monthStart = (year: number, month: number) => `${year}-${String(month).padStart(2, '0')}-01`

// This month's expenses, including writes still queued on this device.
export function useMonthExpenses(): ExpRow[] | undefined {
  const { group, month, year } = useAppContext()
  const { adds, deletedIds } = usePendingExpenseWrites()
  const { data } = useQuery({
    queryKey: ['expenses', group?.id, 'month', year, month],
    queryFn: async (): Promise<ExpRow[]> => {
      const { data, error } = await createClient()
        .from('expenses')
        .select(EXPENSE_SELECT)
        .eq('group_id', group!.id)
        .gte('expense_date', monthStart(year, month))
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data as unknown as ExpRow[]) ?? []
    },
    enabled: !!group,
  })
  if (data === undefined) return undefined
  const from = monthStart(year, month)
  const monthAdds = adds.filter(a => a.group_id === group?.id && a.expense_date >= from)
  return applyPendingExpenses<ExpRow>(data, monthAdds, deletedIds)
}

export function useBudget() {
  const { group, month, year } = useAppContext()
  return useQuery({
    queryKey: ['budget', group?.id, year, month],
    queryFn: async (): Promise<BudgetRow | null> => {
      const { data, error } = await createClient()
        .from('budgets')
        .select('id, total_amount')
        .eq('group_id', group!.id)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle()
      if (error) throw error
      return data as unknown as BudgetRow | null
    },
    enabled: !!group,
  })
}

function useBudgetCategoryRows(budgetId: string | undefined) {
  return useQuery({
    queryKey: ['budgetCategories', budgetId],
    queryFn: async (): Promise<BCRow[]> => {
      const { data, error } = await createClient()
        .from('budget_categories')
        .select('allocated_amount, categories(id, name, icon, color, bg_color)')
        .eq('budget_id', budgetId!)
      if (error) throw error
      return (data as unknown as BCRow[]) ?? []
    },
    enabled: !!budgetId,
  })
}

// Derived views below return undefined while their inputs are still loading.

export function useBudgetSummary() {
  const budget = useBudget()
  const expenses = useMonthExpenses()
  if (budget.data === undefined || expenses === undefined) return undefined
  return budgetSummary(budget.data, expenses)
}

export function useMemberSpend() {
  const members = useGroupMembers()
  const expenses = useMonthExpenses()
  if (members.data === undefined || expenses === undefined) return undefined
  return memberSpend(members.data, expenses)
}

export function useBudgetCategories() {
  const budget = useBudget()
  const rows = useBudgetCategoryRows(budget.data?.id)
  const expenses = useMonthExpenses()
  if (budget.data === undefined || expenses === undefined) return undefined
  if (budget.data === null) return []
  if (rows.data === undefined) return undefined
  return budgetCategoryUsage(rows.data, expenses)
}

// Today's expenses or, when nothing was spent today, the most recent day that
// had spend. Usually derived from this month's expenses; only queries further
// back when the month has no spend up to today.
export function useSpendDay(): SpendDay | undefined {
  const { group } = useAppContext()
  const { deletedIds } = usePendingExpenseWrites()
  // Same UTC date basis the add-expense form uses for its default expense_date.
  const today = todayDate()
  const month = useMonthExpenses()
  const inMonth = month === undefined ? undefined : latestSpendDate(month, today)

  const earlier = useQuery({
    queryKey: ['expenses', group?.id, 'latestDay', today],
    queryFn: async (): Promise<SpendDay> => {
      const supabase = createClient()
      const { data: latest, error } = await supabase
        .from('expenses')
        .select('expense_date')
        .eq('group_id', group!.id)
        .lte('expense_date', today)
        .order('expense_date', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      if (!latest) return spendDay(null, [], today)

      const date = (latest as { expense_date: string }).expense_date
      const { data, error: dayError } = await supabase
        .from('expenses')
        .select(EXPENSE_SELECT)
        .eq('group_id', group!.id)
        .eq('expense_date', date)
        .order('created_at', { ascending: false })
      if (dayError) throw dayError
      return spendDay(date, (data as unknown as ExpRow[]) ?? [], today)
    },
    enabled: !!group && inMonth === null,
  })

  if (month === undefined) return undefined
  if (inMonth) return spendDay(inMonth, month, today)
  if (!earlier.data) return undefined
  return { ...earlier.data, expenses: earlier.data.expenses.filter(e => !deletedIds.has(e.id)) }
}
