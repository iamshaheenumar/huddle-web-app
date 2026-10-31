'use client'

import { useAppContext, useGroupMembers, useCategories } from '@/features/common/queries'
import { useMonthExpenses } from '@/features/dashboard/queries'
import type { Category } from '@/types'

export type Payer = { id: string; display_name: string; avatar_color: string }

export type ExpenseAddData = {
  groupId: string
  groupName: string
  members: Payer[]
  // Most used this month first, then by name.
  categories: Category[]
  currentUserId: string
}

// Everything the add-expense form needs, from the client cache; undefined until loaded.
export function useExpenseAddData(): ExpenseAddData | undefined {
  const { user, group } = useAppContext()
  const members = useGroupMembers()
  const categories = useCategories()
  // Only orders the categories, so the form doesn't wait for it.
  const monthExpenses = useMonthExpenses()
  if (!user || !group || !members.data || !categories.data) return undefined

  const uses = new Map<string, number>()
  for (const e of monthExpenses ?? []) {
    if (e.category_id) uses.set(e.category_id, (uses.get(e.category_id) ?? 0) + 1)
  }
  const byUse = [...categories.data].sort((a, b) =>
    (uses.get(b.id) ?? 0) - (uses.get(a.id) ?? 0) || a.name.localeCompare(b.name))

  return {
    groupId: group.id,
    groupName: group.name,
    members: members.data.flatMap(m => (m.profiles ? [{ id: m.user_id, ...m.profiles }] : [])),
    categories: byUse,
    currentUserId: user.id,
  }
}
