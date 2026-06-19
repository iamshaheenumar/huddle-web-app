import { CURRENCY, MONTHS } from '@/lib/constants'
import { fmt } from '@/lib/format'
import { getMembers, getMembersSummary } from '../data'

export default async function GroupTotalCard() {
  const [{ month, totalSpent, totalBudget, pctUsed, memberCount }, members] = await Promise.all([
    getMembersSummary(),
    getMembers(),
  ])

  return (
    <div className="mx-5 mt-5 rounded-3xl p-5 text-white" style={{ background: '#20242E' }}>
      <div className="flex justify-between items-start">
        <div>
          <div className="text-[12px] font-semibold opacity-70">Consumed</div>
          <div className="text-[28px] font-extrabold tracking-tight mt-0.5">{CURRENCY} {fmt(totalSpent)}</div>
        </div>
        <div className="text-right">
          <div className="text-[12px] font-semibold opacity-70">Total budget</div>
          <div className="text-[18px] font-extrabold mt-0.5">{fmt(totalBudget)}</div>
        </div>
      </div>
      <div className="h-2 rounded-full mt-4 overflow-hidden flex" style={{ background: 'rgba(255,255,255,.18)' }}>
        {members.map(m => {
          const w = totalSpent > 0 ? (m.spent / totalSpent) * pctUsed : 0
          return <div key={m.user_id} style={{ width: `${w}%`, background: m.color }} />
        })}
      </div>
      <div className="text-[12px] font-semibold opacity-70 mt-2.5">
        {pctUsed}% of budget used across {memberCount} members in {MONTHS[month - 1]}
      </div>
    </div>
  )
}
