'use client'

import { CURRENCY, MONTHS } from '@/lib/constants'
import { fmt } from '@/lib/format'
import { useMemberStats, useMembersSummary } from '../queries'
import GroupTotalCardSkeleton from './GroupTotalCardSkeleton'

// A white card rather than the blue summary fill: its bar is split by member
// colour, and a blue avatar colour would vanish on a blue card.
export default function GroupTotalCard() {
  const summary = useMembersSummary()
  const members = useMemberStats()
  if (!summary || !members) return <GroupTotalCardSkeleton />
  const { month, totalSpent, totalBudget, pctUsed, memberCount } = summary

  return (
    <div className="mx-5 mt-5 rounded-3xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--hairline)' }}>
      <div className="flex justify-between items-start">
        <div>
          <div className="text-meta font-medium" style={{ color: 'var(--muted)' }}>Spent in {MONTHS[month - 1]}</div>
          <div className="text-figure font-extrabold tracking-tight tabular-nums mt-0.5" style={{ color: 'var(--ink)' }}>{CURRENCY} {fmt(totalSpent)}</div>
        </div>
        <div className="text-right">
          <div className="text-meta font-medium" style={{ color: 'var(--muted)' }}>Budget</div>
          <div className="text-section font-extrabold tabular-nums mt-0.5" style={{ color: 'var(--ink)' }}>{fmt(totalBudget)}</div>
        </div>
      </div>
      <div className="h-2 rounded-full mt-4 overflow-hidden flex gap-0.5" style={{ background: 'var(--track)' }} aria-hidden="true">
        {members.map(m => {
          const w = totalSpent > 0 ? (m.spent / totalSpent) * pctUsed : 0
          return w > 0 ? <div key={m.user_id} style={{ width: `${w}%`, background: m.color }} /> : null
        })}
      </div>
      <div className="text-meta font-medium mt-2.5" style={{ color: 'var(--ink-2)' }}>
        {pctUsed}% of the budget used across {memberCount} member{memberCount === 1 ? '' : 's'}
      </div>
    </div>
  )
}
