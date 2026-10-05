import Link from 'next/link'
import { getAuth } from '@/lib/auth'
import { getActiveGroup, getOrCreateActiveInvite, listEmailInvites } from '@/lib/group'
import InviteCard from './InviteCard'
import SentInvites from './SentInvites'

export default async function InviteMemberPage() {
  const { supabase, user } = await getAuth()

  const group = await getActiveGroup(supabase, user.id)
  const [code, invites] = await Promise.all([
    getOrCreateActiveInvite(supabase, group.id, user.id),
    listEmailInvites(supabase, group.id),
  ])

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#F6F3EE' }}>
      <div className="flex items-center gap-3.5 px-5 pt-14">
        <Link href="/members" aria-label="Back to members" className="w-10 h-10 rounded-[13px] flex items-center justify-center" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="#20242E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </Link>
        <span className="text-[18px] font-extrabold tracking-tight" style={{ color: '#20242E' }}>Invite to {group.name}</span>
      </div>

      <InviteCard code={code} groupId={group.id} />

      <p className="mx-7 mt-3.5 text-[13px] font-medium leading-normal" style={{ color: '#9A9FA8', textWrap: 'pretty' }}>
        Anyone with the code or link can join {group.name} until it expires. Generating a new code turns off the old one.
      </p>

      <SentInvites invites={invites} />
    </div>
  )
}
