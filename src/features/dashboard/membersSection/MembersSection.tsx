'use client'

import Link from 'next/link'
import { fmt } from '@/lib/format'
import { useAppContext } from '@/features/common/queries'
import { useMemberSpend } from '../queries'
import MembersSectionSkeleton from './MembersSectionSkeleton'

// Who spent what this month: one stacked bar plus a legend, in place of a row per member.
export default function MembersSection() {
  const { user } = useAppContext()
  const members = useMemberSpend()
  if (!members) return <MembersSectionSkeleton />
  if (members.length === 0) return null

  const total = members.reduce((s, m) => s + m.spent, 0)
  const ranked = [...members].sort((a, b) => b.spent - a.spent).map(m => ({
    ...m,
    name: m.user_id === user?.id ? 'You' : (m.profile?.display_name ?? 'Member').split(' ')[0],
    color: m.profile?.avatar_color ?? '#3B6FF6',
    share: total ? Math.round((m.spent / total) * 100) : 0,
  }))

  return (
    <>
      <div className="flex items-baseline justify-between px-5 pt-6">
        <span className="text-[17px] font-extrabold" style={{ color: 'var(--ink)' }}>Who spent what</span>
        <Link href="/members" className="text-[13px] font-bold py-2" style={{ color: 'var(--primary)' }}>See all</Link>
      </div>
      <div className="mx-5 mt-1 rounded-[22px] p-4" style={{ background: '#fff', border: '1px solid var(--hairline)' }}>
        {total > 0 && (
          <div className="flex gap-0.5 h-2.5 rounded-full overflow-hidden" aria-hidden="true">
            {ranked.filter(m => m.spent > 0).map(m => (
              <div key={m.user_id} style={{ width: `${(m.spent / total) * 100}%`, background: m.color }} />
            ))}
          </div>
        )}
        <div className={`grid grid-cols-3 gap-x-3 gap-y-3 ${total > 0 ? 'mt-3.5' : ''}`}>
          {ranked.map(m => (
            <div key={m.user_id} className="flex flex-col gap-0.5 min-w-0">
              <span className="flex items-center gap-1.5 text-[12px] font-semibold min-w-0" style={{ color: 'var(--muted)' }}>
                <span className="shrink-0 rounded-full" style={{ width: 8, height: 8, background: m.color }} />
                <span className="truncate">{m.name}</span>
                <span className="shrink-0">· {m.share}%</span>
              </span>
              <span className="text-[15px] font-extrabold tabular-nums" style={{ color: 'var(--ink)' }}>{fmt(m.spent)}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
