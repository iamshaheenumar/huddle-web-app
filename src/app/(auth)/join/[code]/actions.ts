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
