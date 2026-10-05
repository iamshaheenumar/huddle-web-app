import { cache } from 'react'
import { getAuth } from '@/lib/auth'
import type { Profile } from '@/types'

export const getProfile = cache(async (): Promise<Profile | null> => {
  const { supabase, user } = await getAuth()
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  return data as Profile | null
})
