import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getActiveGroup } from '@/lib/group'
import NameGroupForm from './NameGroupForm'

// Last onboarding step. The signup trigger already made a group ("Home"), so
// this names it rather than creating another.
export default async function NameGroupPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const group = await getActiveGroup(supabase, user.id)
  return <NameGroupForm group={group} />
}
