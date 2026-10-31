import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import InviteAcceptCard from './InviteAcceptCard'

type InvitePreview = {
  group_id: string
  group_name: string
  inviter_name: string
  member_count: number
  members: { display_name: string; avatar_color: string }[]
}

export default async function JoinGroupPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const supabase = await createClient()

  const [{ data: preview }, { data: { user } }] = await Promise.all([
    supabase.rpc('get_invite_preview', { invite_code: code }),
    supabase.auth.getUser(),
  ])

  const invite = (preview as unknown as InvitePreview[] | null)?.[0]

  if (!invite) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center px-6" style={{ background: 'var(--background)' }}>
        <div className="w-full max-w-sm rounded-3xl p-6 text-center" style={{ background: '#fff', border: '1px solid var(--hairline)' }}>
          <p className="text-row font-bold mb-2" style={{ color: 'var(--ink)' }}>Invite link invalid or expired</p>
          <p className="text-meta font-medium mb-4" style={{ color: 'var(--muted)' }}>Ask whoever invited you to send a new link.</p>
          <Link href={user ? '/dashboard' : '/login'} className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-body font-extrabold text-white" style={{ background: 'var(--primary)' }}>
            {user ? 'Go to dashboard' : 'Go to login'}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <InviteAcceptCard
      code={code}
      groupName={invite.group_name}
      inviterName={invite.inviter_name}
      memberCount={invite.member_count}
      members={invite.members}
      isAuthenticated={!!user}
      needsSetup={!!user?.user_metadata?.invite_pending}
      email={user?.email}
    />
  )
}
