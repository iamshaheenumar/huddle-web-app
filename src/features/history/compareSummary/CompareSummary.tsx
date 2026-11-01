'use client'

import { ArrowDown, ArrowUp, Equals } from '@phosphor-icons/react'
import { CURRENCY } from '@/lib/constants'
import { fmt } from '@/lib/format'
import { HERO_FILL, HERO_PANEL, HERO_SOFT, HERO_TRACK } from '@/features/common/heroCard'
import { useMonthComparison } from '../queries'
import type { CompareSide } from '../types'
import CompareSummarySkeleton from './CompareSummarySkeleton'

const ordinal = (n: number) => {
  const rem = n % 100
  if (rem >= 11 && rem <= 13) return `${n}th`
  return n + (['th', 'st', 'nd', 'rd'][n % 10] ?? 'th')
}

// Total spent in each month and how far apart they are — measured to the same
// day of the month while one of them is still running.
export default function CompareSummary({ a, b }: { a?: string; b?: string }) {
  const c = useMonthComparison(a, b)
  if (!c) return <CompareSummarySkeleton />
  const max = Math.max(c.a.spent, c.b.spent)
  const width = (n: number) => (max > 0 ? `${Math.max(n > 0 ? 2 : 0, (n / max) * 100)}%` : '0%')
  const DeltaIcon = c.delta > 0 ? ArrowUp : c.delta < 0 ? ArrowDown : Equals
  const pct = c.pct !== null && c.delta !== 0 ? ` · ${c.pct > 0 ? '+' : '−'}${Math.abs(c.pct)}%` : ''
  // While a month is running the delta is up to today's day, so say so.
  const byDay = c.toDate ? ` by the ${ordinal(c.toDate.day)}` : ''

  const column = (s: CompareSide, align: 'left' | 'right') => (
    <div className={align === 'right' ? 'text-right' : ''}>
      <div className="text-meta font-medium" style={{ color: HERO_SOFT }}>{s.label}</div>
      <div className="text-title font-extrabold leading-none mt-1.5 tracking-tight tabular-nums">{fmt(s.spent)}</div>
      {s.budget > 0 && <div className="text-label font-semibold mt-1" style={{ color: HERO_SOFT }}>of {fmt(s.budget)} budget</div>}
    </div>
  )

  return (
    <div className="mx-5 mt-4 rounded-3xl p-5 text-white" style={{ background: HERO_FILL }}>
      <div className="flex items-start justify-between gap-3">
        {column(c.a, 'left')}
        {column(c.b, 'right')}
      </div>

      <div className="flex flex-col gap-1.5 mt-4" aria-hidden="true">
        <div className="h-2 rounded-full overflow-hidden" style={{ background: HERO_TRACK }}>
          <div className="h-full rounded-full" style={{ width: width(c.a.spent), background: '#fff' }} />
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: HERO_TRACK }}>
          <div className="h-full rounded-full" style={{ width: width(c.b.spent), background: 'rgba(255,255,255,.55)' }} />
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-4 rounded-2xl px-3 py-2 text-body font-bold" style={{ background: HERO_PANEL }}>
        <DeltaIcon size={15} weight="bold" aria-hidden="true" />
        {c.delta === 0
          ? `Same spend as ${c.b.short}${byDay}`
          : `${CURRENCY} ${fmt(Math.abs(c.delta))} ${c.delta > 0 ? 'more' : 'less'} than ${c.b.short}${byDay}${pct}`}
      </div>

      {c.toDate && (
        <div className="text-meta font-semibold mt-3" style={{ color: HERO_SOFT }}>
          By the {ordinal(c.toDate.day)}: {fmt(c.toDate.a)} in {c.a.short} vs {fmt(c.toDate.b)} in {c.b.short}
        </div>
      )}
      {(c.a.income > 0 || c.b.income > 0) && (
        <div className="text-meta font-semibold mt-1.5" style={{ color: HERO_SOFT }}>
          Income: +{fmt(c.a.income)} in {c.a.short} vs +{fmt(c.b.income)} in {c.b.short}
        </div>
      )}
    </div>
  )
}
