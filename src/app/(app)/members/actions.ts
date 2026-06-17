'use server'
import { createClient } from '@/lib/supabase/server'
import { getActiveGroup } from '@/lib/group'
import { revalidatePath } from 'next/cache'

export async function removeMember(userId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  if (user.id === userId) return { error: 'Cannot remove yourself' }

  const group = await getActiveGroup(supabase, user.id)

  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', group.id)
    .eq('user_id', userId)

  if (error) return { error: error.message }

  revalidatePath('/members')
  return {}
}
