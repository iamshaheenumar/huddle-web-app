'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { inviteByEmail } from '@/features/members/actions'
import type { EmailInvite } from '@/lib/group'

function sentAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function SentInvites({ invites }: { invites: EmailInvite[] }) {
  const router = useRouter()
  const [resending, setResending] = useState<string | null>(null)
  const [error, setError] = useState('')

  if (invites.length === 0) return null

  async function handleResend(target: string) {
    setResending(target)
    setError('')
    const result = await inviteByEmail(target)
    if (result.error) setError(result.error)
    else router.refresh()
    setResending(null)
  }

  return (
    <>
      <div className="px-5 pt-6 text-[17px] font-extrabold" style={{ color: '#20242E' }}>Sent invites</div>
      <div className="mx-5 mt-3 rounded-[22px] py-1.5 px-4" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
        {invites.map((inv, i) => (
          <div key={inv.email} className="flex items-center gap-3 py-3" style={{ borderBottom: i < invites.length - 1 ? '1px solid #F4F0E9' : 'none' }}>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-bold truncate" style={{ color: '#20242E' }}>{inv.email}</div>
              <div className="text-[12px] font-semibold mt-0.5" style={{ color: '#9A9FA8' }}>
                {inv.accepted_at ? 'Joined the group' : `Pending · sent ${sentAgo(inv.last_sent_at)}`}
              </div>
            </div>
            {inv.accepted_at ? (
              <span className="text-[11px] font-extrabold rounded-full px-2.5 py-1" style={{ color: '#2E9E6B', background: '#E6F4EC' }}>Joined</span>
            ) : (
              <button
                onClick={() => handleResend(inv.email)}
                disabled={resending !== null}
                className="rounded-full px-3 py-1.5 text-[12px] font-bold disabled:opacity-60"
                style={{ background: '#F6F3EE', color: '#3B6FF6' }}
              >
                {resending === inv.email ? 'Sending…' : 'Resend'}
              </button>
            )}
          </div>
        ))}
      </div>
      {error && <p className="mx-5 text-xs font-semibold rounded-xl px-3 py-2 mt-2.5" style={{ color: '#E0563E', background: '#FBE7E1' }}>{error}</p>}
    </>
  )
}
