import type { SupabaseClient } from '@supabase/supabase-js'
import type { AuthUser } from '@/lib/auth'
import { MEMBER_COLORS } from '@/lib/constants'

export async function getOrCreateProfile(supabase: SupabaseClient, user: AuthUser): Promise<void> {
  const { data: existing } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle()
  if (existing) return

  const displayName = user.email?.split('@')[0] ?? 'New member'
  const avatarColor = MEMBER_COLORS[Math.floor(Math.random() * MEMBER_COLORS.length)]

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, display_name: displayName, avatar_color: avatarColor }, { onConflict: 'id', ignoreDuplicates: true })

  if (error) throw new Error(error.message)
}
