'use client'

import { MONTHS, CURRENCY } from '@/lib/constants'
import { fmt } from '@/lib/format'
import { useAppContext } from '@/features/common/queries'
import { signedNet } from '@/lib/transactions'
import { useBudgetSummary, useMonthCashFlow } from '../queries'
import { HERO_FILL as FILL, HERO_OVER_FILL as OVER_FILL, HERO_SOFT as SOFT, HERO_PANEL as PANEL, HERO_TRACK } from '@/features/common/heroCard'
import BudgetHeroCardSkeleton from './BudgetHeroCardSkeleton'

export default function BudgetHeroCard() {
  const { month, year } = useAppContext()
  const summary = useBudgetSummary()
  // Same month's rows as the summary, so it's ready at the same time.
  const flow = useMonthCashFlow()
  if (!summary) return <BudgetHeroCardSkeleton />
  const { remaining, totalBudget, totalSpent, recurringPaid, recurringDue, flexibleBudget, spendable } = summary

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
  // Where spending should be by today: recurring payments already logged, plus
  // the rest of the budget spread evenly over the month.
  const pacePct = hasBudget
    ? Math.min(100, ((recurringPaid + Math.max(0, flexibleBudget) * (now.getDate() / daysInMonth)) / totalBudget) * 100)
    : 0
  // Spending that eats into recurring payments still due is too fast even before the bar shows it.
  const fasterThanPlanned = hasBudget && !over && (barPct > pacePct + 5 || spendable < 0)
  // Recurring payments still due this month are set aside first.
  const perDay = hasBudget && !over ? Math.floor(Math.max(0, spendable) / daysLeft) : 0

  const heroAmount = hasBudget ? Math.abs(remaining) : totalSpent
  const heroText = fmt(heroAmount)
  // Long amounts step down a size so they never wrap or clip.
  const heroSize = heroText.length > 7 ? 'text-figure' : 'text-display'
  const heroSuffix = !hasBudget ? 'spent' : over ? 'over' : 'left'
  const subLabel = !hasBudget
    ? `No budget set for ${MONTHS[month - 1]}`
    : over
      ? `Over your ${CURRENCY} ${fmt(totalBudget)} budget`
      : `of ${CURRENCY} ${fmt(totalBudget)} · ${fasterThanPlanned ? 'spending faster than planned' : 'on track'}`

  // What's safe to spend, and (once there's income) the month's net, side by side.
  // On the last day "per day" is just everything left, so it says so plainly.
  const tiles: { label: string; value: string; currency?: boolean; detail?: string }[] = []
  if (hasBudget && !over) {
    tiles.push({
      label: daysLeft === 1 ? 'Left for today' : 'Safe to spend per day',
      value: fmt(perDay),
      currency: true,
      detail: recurringDue > 0 ? `After ${fmt(recurringDue)} recurring due` : undefined,
    })
  }
  if (flow && flow.income > 0) {
    tiles.push({ label: 'Net this month', value: signedNet(flow.net), detail: `+${fmt(flow.income)} in · ${fmt(flow.spent)} out` })
  }

  return (
    <div className="mx-5 mt-5 rounded-3xl p-5 text-white" style={{ background: over ? OVER_FILL : FILL }}>
      <div className="flex justify-between items-center gap-3">
        <span className="text-body font-bold truncate" style={{ color: SOFT }}>
          {MONTHS[month - 1]} · {daysLeft} day{daysLeft === 1 ? '' : 's'} left
        </span>
        {hasBudget && (
          <span className="shrink-0 whitespace-nowrap text-meta font-bold rounded-full px-2.5 py-1" style={{ background: PANEL }}>
            {pct}% used
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2 mt-3 min-w-0">
        <span className="shrink-0 text-section font-bold" style={{ color: SOFT }}>{CURRENCY}</span>
        <span className={`${heroSize} font-extrabold leading-none tabular-nums whitespace-nowrap`} style={{ letterSpacing: '-0.03em' }}>{heroText}</span>
        <span className="shrink-0 text-row font-semibold" style={{ color: SOFT }}>{heroSuffix}</span>
      </div>
      <div className="text-meta font-semibold mt-1.5" style={{ color: SOFT }}>{subLabel}</div>

      {hasBudget && (
        <div className="relative mt-4 mb-5" role="img" aria-label={`${pct}% of the budget used, ${Math.round(pacePct)}% of the month gone`}>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: HERO_TRACK }}>
            <div className="h-full rounded-full" style={{ width: `${barPct}%`, background: '#fff' }} />
          </div>
          {/* Where spending would be on plan: recurring so far plus the rest spread evenly. */}
          <div className="absolute -top-1 w-0.5 h-4 rounded-full" style={{ left: `${pacePct}%`, background: '#FFD66B' }} />
          <div className="absolute top-3.5 -translate-x-1/2 text-label font-bold whitespace-nowrap" style={{ left: `${Math.min(92, Math.max(8, pacePct))}%`, color: '#fff' }}>today</div>
        </div>
      )}

      {tiles.length > 0 && (
        <div className={`grid gap-2 ${hasBudget ? 'mt-2' : 'mt-4'} ${tiles.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {tiles.map(t => (
            <div key={t.label} className="min-w-0 rounded-2xl px-3.5 py-3" style={{ background: PANEL }}>
              <div className="text-meta font-bold truncate" style={{ color: SOFT }}>{t.label}</div>
              <div className="flex items-baseline gap-1 mt-1 whitespace-nowrap tabular-nums">
                {t.currency && <span className="text-meta font-bold" style={{ color: SOFT }}>{CURRENCY}</span>}
                <span className="text-title font-extrabold">{t.value}</span>
              </div>
              {t.detail && <div className="text-label font-semibold mt-0.5 truncate" style={{ color: SOFT }}>{t.detail}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
