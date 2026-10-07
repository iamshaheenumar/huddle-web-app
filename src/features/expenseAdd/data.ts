import { cache } from 'react'
import { getAuth } from '@/lib/auth'
import { getActiveGroup } from '@/lib/group'
import type { Category, Profile } from '@/types'

export type ExpenseAddData = {
  groupId: string
  groupName: string
  members: Profile[]
  categories: Category[]
  currentUser: Profile | null
}

export const getExpenseAddData = cache(async (): Promise<ExpenseAddData> => {
  const { supabase, user } = await getAuth()

  const [profileRes, group] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    getActiveGroup(supabase, user.id),
  ])

  const currentUser = profileRes.data as Profile | null

  // Defaults (group_id null) plus this group's custom categories.
  const [{ data: membersData }, catsRes] = await Promise.all([
    supabase.from('group_members').select('user_id, profiles(*)').eq('group_id', group.id),
    supabase.from('categories').select('*').or(`group_id.is.null,group_id.eq.${group.id}`).order('name'),
  ])
  const members = ((membersData as unknown as { user_id: string; profiles: Profile }[]) ?? []).map(m => m.profiles).filter(Boolean)

  const categories = (catsRes.data as unknown as Category[]) ?? []

  return { groupId: group.id, groupName: group.name, members, categories, currentUser }
})
