'use client'

import { useAppContext, useCategories } from '@/features/common/queries'
import { useBudgetCategories, useMonthExpenses } from '@/features/dashboard/queries'
import type { Category } from '@/types'
import type { CategoryExpense } from './types'

export type CategoryDetail = {
  // null when the id doesn't match any category the group can see
  category: Category | null
  month: number
  expenses: CategoryExpense[]
  summary: ReturnType<typeof categorySummary>
}

function categorySummary(allocated: number, expenses: CategoryExpense[]) {
  const totalConsumed = expenses.reduce((s, e) => s + e.amount, 0)
  const available = allocated - totalConsumed
  const pct = allocated > 0 ? Math.min(100, (totalConsumed / allocated) * 100) : 0
  const pctLeft = 100 - pct
  const overspent = allocated > 0 && totalConsumed > allocated
  const overspendAmount = Math.max(0, totalConsumed - allocated)
  const overspendPct = allocated > 0 ? Math.max(0, ((totalConsumed - allocated) / allocated) * 100) : 0
  // budgetFraction = share of the *filled* ring that is in-budget (used to draw the red overspend segment)
  const budgetFraction = totalConsumed > 0 ? Math.min(100, (allocated / totalConsumed) * 100) : 0
  return { allocated, totalConsumed, available, pct, pctLeft, overspent, overspendAmount, overspendPct, budgetFraction }
}

// One category's month in the active group, built from the shared category,
// month-expense and budget queries (queued writes included); undefined while loading.
export function useCategoryDetail(id: string): CategoryDetail | undefined {
  const { month } = useAppContext()
  const { data: categories } = useCategories()
  const monthExpenses = useMonthExpenses()
  const budgetCategories = useBudgetCategories()
  if (!categories || !monthExpenses || !budgetCategories) return undefined

  const expenses = monthExpenses
    .filter(e => e.category_id === id)
    .sort((a, b) => b.expense_date.localeCompare(a.expense_date))
    .map(e => ({ id: e.id, pending: e.pending, amount: e.amount, note: e.note, expense_date: e.expense_date, profile: e.profiles }))
  const allocated = budgetCategories.find(bc => bc.category?.id === id)?.allocated_amount ?? 0

  return {
    category: categories.find(c => c.id === id) ?? null,
    month,
    expenses,
    summary: categorySummary(allocated, expenses),
  }
}
