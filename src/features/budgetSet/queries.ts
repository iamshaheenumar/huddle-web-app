'use client'

import { useAppContext, useCategories } from '@/features/common/queries'
import { useBudget, useBudgetCategories } from '@/features/dashboard/queries'
import type { Category } from '@/types'

export type BudgetSetData = {
  groupId: string
  groupName: string
  categories: Category[]
  totalBudget: number
  allocations: Record<string, number>
  month: number
  year: number
  // The earlier month whose budget these values were carried forward from, until
  // this month gets one of its own.
  carriedFrom: { month: number; year: number } | null
}

// The budget in effect this month for the active group as the form's starting values, from
// the shared category and budget queries; undefined while loading.
export function useBudgetSetData(): BudgetSetData | undefined {
  const { group, month, year } = useAppContext()
  const { data: categories } = useCategories()
  const { data: budget } = useBudget()
  const budgetCategories = useBudgetCategories()
  if (!group || !categories || budget === undefined || !budgetCategories) return undefined

  const allocations: Record<string, number> = {}
  if (budget) budgetCategories.forEach(bc => { allocations[bc.category.id] = bc.allocated_amount })
  else categories.forEach(c => { allocations[c.id] = 0 })

  const carriedFrom = budget && (budget.month !== month || budget.year !== year) ? { month: budget.month, year: budget.year } : null
  return { groupId: group.id, groupName: group.name, categories, totalBudget: budget?.total_amount ?? 0, allocations, month, year, carriedFrom }
}
