'use client'

import { useAppContext, useGroupMembers, useCategories } from '@/features/common/queries'
import type { Category } from '@/types'

export type Payer = { id: string; display_name: string; avatar_color: string }

export type ExpenseAddData = {
  groupId: string
  groupName: string
  members: Payer[]
  categories: Category[]
  currentUserId: string
}

// Everything the add-expense form needs, from the client cache; undefined until loaded.
export function useExpenseAddData(): ExpenseAddData | undefined {
  const { user, group } = useAppContext()
  const members = useGroupMembers()
  const categories = useCategories()
  if (!user || !group || !members.data || !categories.data) return undefined

  return {
    groupId: group.id,
    groupName: group.name,
    members: members.data.flatMap(m => (m.profiles ? [{ id: m.user_id, ...m.profiles }] : [])),
    categories: categories.data,
    currentUserId: user.id,
  }
}
