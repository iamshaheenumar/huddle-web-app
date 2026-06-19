import MemberAvatar from '@/features/common/MemberAvatar'
import { fmt } from '@/lib/format'
import { getMembers, getIsOwner } from '../data'
import RemoveMemberButton from '../removeMemberButton/RemoveMemberButton'

export default async function MemberList() {
  const [members, isOwner] = await Promise.all([getMembers(), getIsOwner()])
  const maxSpent = members[0]?.spent ?? 1

  return (
    <>
      <div className="px-5 pt-5 pb-3">
        <span className="text-base font-extrabold" style={{ color: '#20242E' }}>Spending by member</span>
      </div>
      <div className="mx-5 flex flex-col gap-2.5">
        {members.map(m => {
          const barPct = maxSpent > 0 ? (m.spent / maxSpent) * 100 : 0
          return (
            <div key={m.user_id} className="rounded-[18px] p-3.5" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
              <div className="flex items-center gap-3">
                <MemberAvatar name={m.profile?.display_name ?? '?'} color={m.color} size={40} fontSize={15} />
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-extrabold flex items-center gap-2" style={{ color: '#2A2E37' }}>
                    {m.profile?.display_name ?? 'Unknown'}
                    {m.role === 'owner' && (
                      <span className="text-[10px] font-bold rounded-[5px] px-1.5 py-0.5" style={{ color: '#3B6FF6', background: '#E9F0FE' }}>Owner</span>
                    )}
                  </div>
                  <div className="text-[11px] font-semibold mt-0.5" style={{ color: '#9A9FA8' }}>{m.txCount} transaction{m.txCount !== 1 ? 's' : ''}</div>
                </div>
                <span className="text-[16px] font-extrabold tabular-nums text-right" style={{ color: '#20242E' }}>{fmt(m.spent)}</span>
                {isOwner && (
                  <div className="w-8 flex justify-end shrink-0">
                    {m.role !== 'owner' && (
                      <RemoveMemberButton userId={m.user_id} name={m.profile?.display_name ?? 'this member'} />
                    )}
                  </div>
                )}
              </div>
              <div className="h-1.5 rounded-full mt-3 overflow-hidden" style={{ background: '#EFEBE3' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${barPct}%`, background: m.color }} />
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
