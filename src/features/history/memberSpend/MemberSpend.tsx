import MemberAvatar from '@/features/common/MemberAvatar'
import { fmt } from '@/lib/format'
import { getPeriodMembers } from '../data'
import TxnList from '../txnList/TxnList'

export default async function MemberSpend({ period }: { period?: string }) {
  const members = await getPeriodMembers(period)
  if (members.length === 0) return null

  return (
    <>
      <div className="px-5 pt-6">
        <span className="text-base font-extrabold" style={{ color: '#20242E' }}>Spend by member</span>
      </div>
      <div className="flex flex-col gap-2.5 px-5 mt-3">
        {members.map(m => (
          <details key={m.user_id} className="group rounded-[20px] p-4" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
            <summary className="flex items-center gap-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <MemberAvatar name={m.profile?.display_name ?? '?'} color={m.profile?.avatar_color ?? '#3B6FF6'} size={38} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[14px] font-bold truncate" style={{ color: '#2A2E37' }}>{m.profile?.display_name ?? 'Unknown'}</span>
                  <span className="text-[13px] font-bold tabular-nums shrink-0" style={{ color: '#20242E' }}>
                    {fmt(m.spent)} <span style={{ color: '#B6BAC1', fontWeight: 600 }}>· {m.share}%</span>
                  </span>
                </div>
                <div className="h-1.5 rounded-full mt-2.5 overflow-hidden" style={{ background: '#EFEBE3' }}>
                  <div className="h-full rounded-full" style={{ width: `${m.share}%`, background: m.profile?.avatar_color ?? '#3B6FF6' }} />
                </div>
              </div>
              <svg className="shrink-0 transition-transform group-open:rotate-90" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C6C2B9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            </summary>
            <TxnList transactions={m.transactions} show="category" />
          </details>
        ))}
      </div>
    </>
  )
}
