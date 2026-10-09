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
}

// This month's budget for the active group as the form's starting values, from
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

  return { groupId: group.id, groupName: group.name, categories, totalBudget: budget?.total_amount ?? 0, allocations, month, year }
}
