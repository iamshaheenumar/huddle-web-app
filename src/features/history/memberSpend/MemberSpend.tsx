'use client'

import MemberAvatar from '@/features/common/MemberAvatar'
import { fmt } from '@/lib/format'
import { usePeriodMembers } from '../queries'
import TxnList from '../txnList/TxnList'
import MemberSpendSkeleton from './MemberSpendSkeleton'

export default function MemberSpend({ period }: { period?: string }) {
  const members = usePeriodMembers(period)
  if (!members) return <MemberSpendSkeleton />
  if (members.length === 0) return null

  return (
    <div className="flex flex-col gap-2.5 px-5 mt-4">
      {members.map(m => (
        <details key={m.user_id} className="group rounded-[20px] p-4" style={{ background: 'var(--card)', border: '1px solid var(--hairline)' }}>
          <summary className="flex items-center gap-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <MemberAvatar name={m.profile?.display_name ?? '?'} color={m.profile?.avatar_color ?? '#3B6FF6'} size={38} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-body font-bold truncate" style={{ color: 'var(--ink)' }}>{m.profile?.display_name ?? 'Unknown'}</span>
                <span className="text-body font-bold tabular-nums shrink-0" style={{ color: 'var(--ink)' }}>
                  {fmt(m.spent)} <span style={{ color: 'var(--muted)', fontWeight: 600 }}>· {m.share}%</span>
                </span>
              </div>
              <div className="h-1.5 rounded-full mt-2.5 overflow-hidden" style={{ background: 'var(--track)' }}>
                <div className="h-full rounded-full" style={{ width: `${m.share}%`, background: m.profile?.avatar_color ?? '#3B6FF6' }} />
              </div>
            </div>
            <svg className="shrink-0 transition-transform group-open:rotate-90" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ color: 'var(--icon-subtle)' }} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
          </summary>
          <TxnList transactions={m.transactions} show="category" />
        </details>
      ))}
    </div>
  )
}
