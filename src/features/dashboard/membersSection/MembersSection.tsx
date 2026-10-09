'use client'

import Link from 'next/link'
import MemberAvatar from '@/features/common/MemberAvatar'
import { fmt } from '@/lib/format'
import { useMemberSpend } from '../queries'
import MembersSectionSkeleton from './MembersSectionSkeleton'

export default function MembersSection() {
  const members = useMemberSpend()
  if (!members) return <MembersSectionSkeleton />
  if (members.length === 0) return null

  const total = members.reduce((s, m) => s + m.spent, 0)

  return (
    <>
      <div className="flex items-center justify-between px-5 pt-6">
        <span className="text-[17px] font-extrabold" style={{ color: '#20242E' }}>Members</span>
        <Link href="/members" className="text-[13px] font-bold" style={{ color: '#3B6FF6' }}>See all</Link>
      </div>
      <div className="mx-5 mt-3 rounded-[22px] py-1 px-4 overflow-hidden" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
        {members.map((m, i) => (
          <div key={m.user_id} className="flex items-center gap-3 py-3" style={{ borderBottom: i === members.length - 1 ? 'none' : '1px solid #F4F0E9' }}>
            <MemberAvatar name={m.profile?.display_name ?? '?'} color={m.profile?.avatar_color ?? '#3B6FF6'} size={34} fontSize={13} />
            <span className="flex-1 min-w-0 text-[14px] font-bold truncate" style={{ color: '#20242E' }}>{m.profile?.display_name ?? 'Member'}</span>
            <span className="text-[12px] font-semibold" style={{ color: '#9A9FA8' }}>{total ? Math.round((m.spent / total) * 100) : 0}%</span>
            <span className="text-[14px] font-extrabold tabular-nums min-w-[44px] text-right" style={{ color: '#20242E' }}>{fmt(m.spent)}</span>
          </div>
        ))}
      </div>
    </>
  )
}
