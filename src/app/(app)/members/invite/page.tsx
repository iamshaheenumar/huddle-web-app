import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getActiveGroup, getOrCreateActiveInvite } from '@/lib/group'
import InviteCodeCard from './InviteCodeCard'

export default async function InviteMemberPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const group = await getActiveGroup(supabase, user.id)
  const code = await getOrCreateActiveInvite(supabase, group.id, user.id)

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#F6F3EE' }}>
      <div className="flex items-center gap-3 px-5 pt-12 pb-0">
        <Link href="/members" className="w-10 h-10 rounded-[13px] flex items-center justify-center" style={{ background: '#fff', border: '1px solid #EAE5DD', color: '#3A3F49' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </Link>
        <span className="text-[17px] font-extrabold" style={{ color: '#20242E' }}>Invite to {group.name}</span>
      </div>

      <p className="px-5 pt-4 text-[13px] font-semibold" style={{ color: '#9A9FA8' }}>
        Share this code or link with whoever you want to join. It expires in 7 days.
      </p>

      <InviteCodeCard code={code} groupId={group.id} />
    </div>
  )
}
