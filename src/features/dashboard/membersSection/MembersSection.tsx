'use client'

import Link from 'next/link'
import { UsersThree } from '@phosphor-icons/react'
import { fmt } from '@/lib/format'
import { useAppContext } from '@/features/common/queries'
import { useMemberSpend } from '../queries'
import MembersSectionSkeleton from './MembersSectionSkeleton'

// Who spent what this month: one stacked bar plus a legend, in place of a row per member.
export default function MembersSection() {
  const { user, group } = useAppContext()
  const members = useMemberSpend()
  if (!members) return <MembersSectionSkeleton />
  if (members.length === 0) return null

  // A split of one says nothing; point at what makes the group useful instead.
  if (members.length === 1) {
    return (
      <div className="mx-5 mt-6 flex items-center gap-3.5 rounded-[22px] p-4" style={{ background: '#fff', border: '1px solid var(--hairline)' }}>
        <div className="flex items-center justify-center shrink-0 rounded-[12px]" style={{ width: 40, height: 40, background: 'var(--primary-soft)', color: 'var(--primary)' }}>
          <UsersThree size={20} weight="fill" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-body font-bold" style={{ color: 'var(--ink)' }}>Budgeting on your own</div>
          <div className="text-meta font-medium mt-0.5" style={{ color: 'var(--muted)' }}>Invite someone to {group?.name ?? 'this group'} to share it.</div>
        </div>
        <Link href="/members/invite" className="shrink-0 flex items-center min-h-10 rounded-full px-3.5 text-body font-bold" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
          Invite
        </Link>
      </div>
    )
  }

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
        <span className="text-section font-extrabold" style={{ color: 'var(--ink)' }}>Who spent what</span>
        <Link href="/members" className="text-body font-bold py-2" style={{ color: 'var(--primary)' }}>See all</Link>
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
              <span className="flex items-center gap-1.5 text-meta font-medium min-w-0" style={{ color: 'var(--muted)' }}>
                <span className="shrink-0 rounded-full" style={{ width: 8, height: 8, background: m.color }} />
                <span className="truncate">{m.name}</span>
                <span className="shrink-0">· {m.share}%</span>
              </span>
              <span className="text-row font-extrabold tabular-nums" style={{ color: 'var(--ink)' }}>{fmt(m.spent)}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
