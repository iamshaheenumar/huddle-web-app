'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAppContext, useGroupMembers } from '@/features/common/queries'
import { applyPendingExpenses, usePendingExpenseWrites, type ExpenseDraft } from '@/lib/query/mutations'
import { historyContext, periodSummary, periodCategories, earlierMonths, periodMembers, periodTransactions, type BudgetRow, type BCRow, type ExpRow } from './derive'

// A queued expense in the shape of a fetched history row.
const draftToRow = (d: ExpenseDraft): ExpRow => ({
  id: d.id,
  note: d.note,
  amount: d.amount,
  expense_date: d.expense_date,
  created_at: d.created_at,
  category_id: d.category_id,
  paid_by: d.paid_by,
  categories: d.categories ? { id: d.category_id, ...d.categories } : null,
})

// The group's whole expense history — fetched once and aggregated per period on
// the client so every section shares one query — plus writes queued on this device.
export function useAllExpenses(): ExpRow[] | undefined {
  const { group } = useAppContext()
  const { adds, deletedIds } = usePendingExpenseWrites()
  const { data } = useQuery({
    queryKey: ['expenses', group?.id, 'all'],
    queryFn: async (): Promise<ExpRow[]> => {
      const supabase = createClient()
      // PostgREST caps a single response (1000 rows by default), which would silently
      // drop the oldest months — page through until a short page comes back.
      const PAGE = 1000
      const rows: ExpRow[] = []
      for (let from = 0; ; from += PAGE) {
        const { data, error } = await supabase
          .from('expenses')
          .select('id, note, amount, expense_date, created_at, category_id, paid_by, categories(id, name, icon, color, bg_color)')
          .eq('group_id', group!.id)
          .order('expense_date', { ascending: false })
          .order('id')
          .range(from, from + PAGE - 1)
        if (error) throw error
        const page = (data as unknown as ExpRow[]) ?? []
        rows.push(...page)
        if (page.length < PAGE) break
      }
      return rows
    },
    enabled: !!group,
  })
  if (data === undefined) return undefined
  const groupAdds = adds.filter(a => a.group_id === group?.id).map(draftToRow)
  return applyPendingExpenses(data, groupAdds, deletedIds)
}

export function useAllBudgets() {
  const { group } = useAppContext()
  return useQuery({
    queryKey: ['budgets', group?.id],
    queryFn: async (): Promise<BudgetRow[]> => {
      const { data, error } = await createClient()
        .from('budgets')
        .select('id, month, year, total_amount')
        .eq('group_id', group!.id)
      if (error) throw error
      return (data as unknown as BudgetRow[]) ?? []
    },
    enabled: !!group,
  })
}

function useAllBudgetCategories() {
  const { group } = useAppContext()
  const { data: budgets } = useAllBudgets()
  return useQuery({
    queryKey: ['budgetCategories', 'group', group?.id, budgets?.map(b => b.id).join()],
    queryFn: async (): Promise<BCRow[]> => {
      if (budgets!.length === 0) return []
      const { data, error } = await createClient()
        .from('budget_categories')
        .select('budget_id, allocated_amount, categories(id, name, icon, color, bg_color)')
        .in('budget_id', budgets!.map(b => b.id))
      if (error) throw error
      return (data as unknown as BCRow[]) ?? []
    },
    enabled: !!group && !!budgets,
  })
}

// Derived views below return undefined while their inputs are still loading.

export function useHistoryContext(periodParam?: string) {
  const { data: budgets } = useAllBudgets()
  const expenses = useAllExpenses()
  if (!budgets || !expenses) return undefined
  return historyContext(budgets, expenses, periodParam)
}

export function usePeriodSummary(periodParam?: string) {
  const ctx = useHistoryContext(periodParam)
  const { data: budgets } = useAllBudgets()
  const expenses = useAllExpenses()
  const { data: members } = useGroupMembers()
  if (!ctx || !budgets || !expenses || !members) return undefined
  return periodSummary(ctx, budgets, expenses, members.length)
}

export function usePeriodCategories(periodParam?: string) {
  const ctx = useHistoryContext(periodParam)
  const { data: budgets } = useAllBudgets()
  const { data: allBc } = useAllBudgetCategories()
  const expenses = useAllExpenses()
  const { data: members } = useGroupMembers()
  if (!ctx || !budgets || !allBc || !expenses || !members) return undefined
  return periodCategories(ctx.selected, budgets, allBc, expenses, members)
}

export function useEarlierMonths(periodParam?: string) {
  const ctx = useHistoryContext(periodParam)
  const { data: budgets } = useAllBudgets()
  const expenses = useAllExpenses()
  if (!ctx || !budgets || !expenses) return undefined
  return earlierMonths(ctx, budgets, expenses)
}

export function usePeriodMembers(periodParam?: string) {
  const ctx = useHistoryContext(periodParam)
  const expenses = useAllExpenses()
  const { data: members } = useGroupMembers()
  if (!ctx || !expenses || !members) return undefined
  return periodMembers(ctx.selected, members, expenses)
}

export function usePeriodTransactions(periodParam?: string) {
  const ctx = useHistoryContext(periodParam)
  const expenses = useAllExpenses()
  const { data: members } = useGroupMembers()
  if (!ctx || !expenses || !members) return undefined
  return periodTransactions(ctx.selected, members, expenses)
}
