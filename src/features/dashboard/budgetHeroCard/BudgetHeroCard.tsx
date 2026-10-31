'use client'

import { MONTHS, CURRENCY } from '@/lib/constants'
import { fmt } from '@/lib/format'
import { useAppContext } from '@/features/common/queries'
import { useBudgetSummary } from '../queries'
import { HERO_FILL as FILL, HERO_OVER_FILL as OVER_FILL, HERO_SOFT as SOFT, HERO_PANEL as PANEL, HERO_TRACK } from '@/features/common/heroCard'
import BudgetHeroCardSkeleton from './BudgetHeroCardSkeleton'

export default function BudgetHeroCard() {
  const { month, year } = useAppContext()
  const summary = useBudgetSummary()
  if (!summary) return <BudgetHeroCardSkeleton />
  const { remaining, totalBudget, totalSpent } = summary

  const hasBudget = totalBudget > 0
  const over = hasBudget && remaining < 0
  // Unclamped so the pill can say e.g. "125% used" once over budget.
  const pct = hasBudget ? Math.round((totalSpent / totalBudget) * 100) : 0
  // Keep a visible sliver once anything is spent, but no stray dot at zero.
  const barPct = !hasBudget || totalSpent <= 0 ? 0 : Math.max(2, Math.min(100, (totalSpent / totalBudget) * 100))

  // The month is always the current one, so today's position in it is the pace to beat.
  const now = new Date()
  const daysInMonth = new Date(year, month, 0).getDate()
  const daysLeft = daysInMonth - now.getDate() + 1
  const pacePct = (now.getDate() / daysInMonth) * 100
  const fasterThanPlanned = hasBudget && !over && barPct > pacePct + 5
  const perDay = hasBudget && !over ? Math.floor(remaining / daysLeft) : 0

  const heroAmount = hasBudget ? Math.abs(remaining) : totalSpent
  const heroText = fmt(heroAmount)
  const heroSize = heroText.length > 9 ? 'text-[32px]' : heroText.length > 7 ? 'text-[38px]' : 'text-[44px]'
  const heroSuffix = !hasBudget ? 'spent' : over ? 'over' : 'left'
  const subLabel = !hasBudget
    ? `No budget set for ${MONTHS[month - 1]}`
    : over
      ? `Over your ${CURRENCY} ${fmt(totalBudget)} budget`
      : `of ${CURRENCY} ${fmt(totalBudget)} · ${fasterThanPlanned ? 'spending faster than planned' : 'on track'}`

  return (
    <div className="mx-5 mt-5 rounded-3xl p-5 text-white" style={{ background: over ? OVER_FILL : FILL }}>
      <div className="flex justify-between items-center gap-3">
        <span className="text-[13px] font-bold truncate" style={{ color: SOFT }}>
          {MONTHS[month - 1]} · {daysLeft} day{daysLeft === 1 ? '' : 's'} left
        </span>
        {hasBudget && (
          <span className="shrink-0 whitespace-nowrap text-[12px] font-bold rounded-full px-2.5 py-1" style={{ background: PANEL }}>
            {pct}% used
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2 mt-3 min-w-0">
        <span className="shrink-0 text-[18px] font-bold" style={{ color: SOFT }}>{CURRENCY}</span>
        <span className={`${heroSize} font-extrabold leading-none tabular-nums whitespace-nowrap`} style={{ letterSpacing: '-0.03em' }}>{heroText}</span>
        <span className="shrink-0 text-[15px] font-semibold" style={{ color: SOFT }}>{heroSuffix}</span>
      </div>
      <div className="text-[13px] font-semibold mt-1.5" style={{ color: SOFT }}>{subLabel}</div>

      {hasBudget && (
        <div className="relative mt-4 mb-5" role="img" aria-label={`${pct}% of the budget used, ${Math.round(pacePct)}% of the month gone`}>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: HERO_TRACK }}>
            <div className="h-full rounded-full" style={{ width: `${barPct}%`, background: '#fff' }} />
          </div>
          {/* Where spending would be if it were spread evenly over the month. */}
          <div className="absolute -top-1 w-0.5 h-4 rounded-full" style={{ left: `${pacePct}%`, background: '#FFD66B' }} />
          <div className="absolute top-3.5 -translate-x-1/2 text-[11px] font-bold whitespace-nowrap" style={{ left: `${Math.min(92, Math.max(8, pacePct))}%`, color: '#fff' }}>today</div>
        </div>
      )}

      {hasBudget && !over && (
        <div className="flex items-center justify-between gap-3 mt-2 rounded-2xl px-3.5 py-3" style={{ background: PANEL }}>
          <span className="text-[13px] font-bold" style={{ color: SOFT }}>Safe to spend per day</span>
          <span className="flex items-baseline gap-1 whitespace-nowrap tabular-nums">
            <span className="text-[12px] font-bold" style={{ color: SOFT }}>{CURRENCY}</span>
            <span className="text-[20px] font-extrabold">{fmt(perDay)}</span>
          </span>
        </div>
      )}
    </div>
  )
}
