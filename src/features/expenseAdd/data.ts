import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileRes, group, catsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    getActiveGroup(supabase, user.id),
    supabase.from('categories').select('*').eq('is_default', true).order('name'),
  ])

  const currentUser = profileRes.data as Profile | null

  const { data: membersData } = await supabase.from('group_members').select('user_id, profiles(*)').eq('group_id', group.id)
  const members = ((membersData as unknown as { user_id: string; profiles: Profile }[]) ?? []).map(m => m.profiles).filter(Boolean)

  const categories = (catsRes.data as unknown as Category[]) ?? []

  return { groupId: group.id, groupName: group.name, members, categories, currentUser }
})
