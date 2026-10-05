'use server'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getActiveGroup, getOrCreateActiveInvite } from '@/lib/group'
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

  revalidatePath('/', 'layout')
  return {}
}

// Sends (or resends) a Supabase invite email whose link lands on the
// group's current /join/CODE page. Only works for emails without an account
// yet — Supabase's invite creates the auth user up front.
export async function inviteByEmail(rawEmail: string): Promise<{ error?: string }> {
  const email = rawEmail.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter a valid email address' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  if (user.email?.toLowerCase() === email) return { error: "That's your own email" }

  const group = await getActiveGroup(supabase, user.id)

  const { data: existing } = await supabase
    .from('group_email_invites')
    .select('accepted_at')
    .eq('group_id', group.id)
    .eq('email', email)
    .maybeSingle()
  if (existing?.accepted_at) return { error: 'They have already joined this group' }

  const code = await getOrCreateActiveInvite(supabase, group.id, user.id)
  const origin = (await headers()).get('origin') ?? ''

  const { error: inviteError } = await createAdminClient().auth.admin.inviteUserByEmail(email, {
    data: { invite_code: code, invite_pending: true },
    redirectTo: `${origin}/auth/confirm?next=/join/${code}`,
  })
  if (inviteError) {
    if (/already been registered/i.test(inviteError.message)) {
      return { error: 'This person already has a Huddle account. Share the invite link with them instead.' }
    }
    return { error: inviteError.message }
  }

  const { error } = await supabase
    .from('group_email_invites')
    .upsert(
      { group_id: group.id, email, invited_by: user.id, last_sent_at: new Date().toISOString() },
      { onConflict: 'group_id,email' }
    )
  if (error) return { error: error.message }

  revalidatePath('/members/invite')
  return {}
}
