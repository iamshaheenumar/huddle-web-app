'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function signupAndJoin(
  email: string,
  password: string,
  displayName: string,
  inviteCode: string
): Promise<{ error?: string }> {
  const admin = createAdminClient()
  const { error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  })
  if (createError) return { error: createError.message }

  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
  if (signInError) return { error: signInError.message }

  const { error: joinError } = await supabase.rpc('join_group_by_code', { invite_code: inviteCode })
  if (joinError) return { error: joinError.message }

  return {}
}

// Finishes signup for someone who arrived via an email invite: they already
// have a session (from /auth/confirm) but no password or real name yet.
export async function completeInviteSignup(
  displayName: string,
  password: string,
  inviteCode: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Your invite session has expired. Open the email link again.' }

  const { error: updateError } = await supabase.auth.updateUser({
    password,
    data: { display_name: displayName, invite_pending: false },
  })
  if (updateError) return { error: updateError.message }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ display_name: displayName })
    .eq('id', user.id)
  if (profileError) return { error: profileError.message }

  const { error: joinError } = await supabase.rpc('join_group_by_code', { invite_code: inviteCode })
  if (joinError) return { error: joinError.message }

  return {}
}
