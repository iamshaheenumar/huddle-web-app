'use client'

import MemberAvatar from '@/features/common/MemberAvatar'
import { fmt } from '@/lib/format'
import { INCOME_COLOR } from '@/lib/transactions'
import { useAppContext } from '@/features/common/queries'
import { useMemberStats, useIsOwner } from '../queries'
import RemoveMemberButton from '../removeMemberButton/RemoveMemberButton'
import MemberListSkeleton from './MemberListSkeleton'

export default function MemberList() {
  const { group } = useAppContext()
  const members = useMemberStats()
  const isOwner = useIsOwner()
  if (!group || !members || isOwner === undefined) return <MemberListSkeleton />
  const maxSpent = members[0]?.spent ?? 1

  return (
    <>
      <div className="px-5 pt-5 pb-3">
        <span className="text-row font-extrabold" style={{ color: 'var(--ink)' }}>Spending by member</span>
      </div>
      <div className="mx-5 flex flex-col gap-2.5">
        {members.map(m => {
          const barPct = maxSpent > 0 ? (m.spent / maxSpent) * 100 : 0
          return (
            <div key={m.user_id} className="rounded-[18px] p-3.5" style={{ background: '#fff', border: '1px solid var(--hairline)' }}>
              <div className="flex items-center gap-3">
                <MemberAvatar name={m.profile?.display_name ?? '?'} color={m.color} size={40} fontSize={15} />
                <div className="flex-1 min-w-0">
                  <div className="text-body font-extrabold flex items-center gap-2" style={{ color: 'var(--ink)' }}>
                    {m.profile?.display_name ?? 'Unknown'}
                    {m.role === 'owner' && (
                      <span className="text-label font-bold rounded-[5px] px-1.5 py-0.5" style={{ color: 'var(--primary)', background: 'var(--primary-soft)' }}>Owner</span>
                    )}
                  </div>
                  <div className="text-label font-semibold mt-0.5" style={{ color: 'var(--muted)' }}>{m.txCount} transaction{m.txCount !== 1 ? 's' : ''}
                    {m.income > 0 && <> · <span style={{ color: INCOME_COLOR }}>+{fmt(m.income)} in</span></>}
                  </div>
                </div>
                <span className="text-row font-extrabold tabular-nums text-right" style={{ color: 'var(--ink)' }}>{fmt(m.spent)}</span>
                {isOwner && (
                  <div className="w-8 flex justify-end shrink-0">
                    {m.role !== 'owner' && (
                      <RemoveMemberButton groupId={group.id} userId={m.user_id} name={m.profile?.display_name ?? 'this member'} />
                    )}
                  </div>
                )}
              </div>
              <div className="h-1.5 rounded-full mt-3 overflow-hidden" style={{ background: 'var(--track)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${barPct}%`, background: m.color }} />
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
