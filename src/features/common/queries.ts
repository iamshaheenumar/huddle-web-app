'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useSession } from '@/lib/query/session'
import { getActiveGroup, listUserGroups } from '@/lib/group'
import { getOrCreateProfile } from '@/lib/profile'
import type { Category, Profile } from '@/types'

export type MemberRow = { user_id: string; role: 'owner' | 'member'; profiles: { display_name: string; avatar_color: string } | null }

// Signed-in user, their active group and the current period — the base every
// feature query keys off. `group` is undefined until it resolves (or loads from cache).
export function useAppContext() {
  const { data: user } = useSession()
  const { data: group } = useQuery({
    queryKey: ['activeGroup', user?.id],
    queryFn: () => getActiveGroup(createClient(), user!.id),
    enabled: !!user,
  })
  const now = new Date()
  return { user, group, month: now.getMonth() + 1, year: now.getFullYear() }
}

export function useProfile() {
  const { user } = useAppContext()
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<Profile | null> => {
      const supabase = createClient()
      const select = () => supabase.from('profiles').select('*').eq('id', user!.id).maybeSingle()
      let { data } = await select()
      // The signup trigger creates the profile; this is a safety net.
      if (!data) {
        await getOrCreateProfile(supabase, user!)
        ;({ data } = await select())
      }
      return data as Profile | null
    },
    enabled: !!user,
  })
}

export function useGroups() {
  const { user } = useAppContext()
  return useQuery({
    queryKey: ['groups', user?.id],
    queryFn: () => listUserGroups(createClient(), user!.id),
    enabled: !!user,
  })
}

export function useGroupMembers() {
  const { group } = useAppContext()
  return useQuery({
    queryKey: ['members', group?.id],
    queryFn: async (): Promise<MemberRow[]> => {
      const { data, error } = await createClient()
        .from('group_members')
        .select('user_id, role, profiles(display_name, avatar_color)')
        .eq('group_id', group!.id)
      if (error) throw error
      return (data as unknown as MemberRow[]) ?? []
    },
    enabled: !!group,
  })
}

// Shared defaults (group_id null) plus this group's custom categories.
export function useCategories() {
  const { group } = useAppContext()
  return useQuery({
    queryKey: ['categories', group?.id],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await createClient()
        .from('categories')
        .select('*')
        .or(`group_id.is.null,group_id.eq.${group!.id}`)
        .order('name')
      if (error) throw error
      return (data as unknown as Category[]) ?? []
    },
    enabled: !!group,
  })
}
