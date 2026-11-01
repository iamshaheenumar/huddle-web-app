import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getActiveGroup, getOrCreateActiveInvite } from '@/lib/group'
import InviteStep from './InviteStep'

// Last set-up step: bring the others in, or carry on solo.
export default async function InviteStepPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const group = await getActiveGroup(supabase, user.id)
  const code = await getOrCreateActiveInvite(supabase, group.id, user.id)
  return <InviteStep group={group} code={code} />
}
