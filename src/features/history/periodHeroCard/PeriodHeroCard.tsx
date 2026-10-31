'use client'

import { CheckCircle, WarningCircle } from '@phosphor-icons/react'
import { CURRENCY } from '@/lib/constants'
import { fmt } from '@/lib/format'
import { HERO_FILL, HERO_OVER_FILL, HERO_PANEL, HERO_SOFT, HERO_TRACK } from '@/features/common/heroCard'
import { usePeriodSummary } from '../queries'
import PeriodHeroCardSkeleton from './PeriodHeroCardSkeleton'

// Same card as Home's month summary, for any month.
export default function PeriodHeroCard({ period }: { period?: string }) {
  const s = usePeriodSummary(period)
  if (!s) return <PeriodHeroCardSkeleton />
  const barWidth = s.overspent ? 100 : (s.hasBudget ? Math.min(100, Math.round((s.totalSpent / s.totalBudget) * 100)) : 0)

  return (
    <div className="mx-5 mt-4 rounded-3xl p-5 text-white" style={{ background: s.overspent ? HERO_OVER_FILL : HERO_FILL }}>
      <div className="flex items-center gap-2">
        <span className="text-row font-extrabold">{s.label}</span>
        <span className="text-label font-bold rounded-full px-2 py-0.5" style={{ background: HERO_PANEL }}>
          {s.closed ? 'Closed' : 'This month'}
        </span>
        {s.hasBudget && (
          <span className="ml-auto text-meta font-bold rounded-full px-2.5 py-1" style={{ background: HERO_PANEL }}>
            {s.pctUsed}% used
          </span>
        )}
      </div>

      <div className="flex items-end justify-between mt-4">
        <div>
          <div className="text-meta font-medium" style={{ color: HERO_SOFT }}>Total spent</div>
          <div className="text-figure font-extrabold leading-none mt-1.5 tracking-tight tabular-nums">{CURRENCY} {fmt(s.totalSpent)}</div>
        </div>
        {s.hasBudget && (
          <div className="text-right">
            <div className="text-meta font-medium" style={{ color: HERO_SOFT }}>Budget</div>
            <div className="text-section font-extrabold mt-1.5 tabular-nums">{fmt(s.totalBudget)}</div>
          </div>
        )}
      </div>

      {s.hasBudget && (
        <div className="h-2 rounded-full mt-4 overflow-hidden" style={{ background: HERO_TRACK }}>
          <div className="h-full rounded-full" style={{ width: `${barWidth}%`, background: '#fff' }} />
        </div>
      )}

      <div className="flex items-center justify-between mt-3 text-meta font-bold" style={{ color: HERO_SOFT }}>
        <span className="flex items-center gap-1.5">
          {s.hasBudget && (s.overspent
            ? <WarningCircle size={14} weight="fill" aria-hidden="true" />
            : <CheckCircle size={14} weight="fill" aria-hidden="true" />)}
          {s.hasBudget
            ? (s.overspent ? `Over budget by ${fmt(Math.abs(s.remaining))}` : `Under budget by ${fmt(s.remaining)}`)
            : 'No budget set'}
        </span>
        <span className="font-semibold">{s.memberCount} member{s.memberCount === 1 ? '' : 's'}</span>
      </div>
    </div>
  )
}
