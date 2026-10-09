'use client'

import { MONTHS, CURRENCY } from '@/lib/constants'
import { fmt } from '@/lib/format'
import { useAppContext } from '@/features/common/queries'
import { useBudgetSummary, useSpendDay } from '../queries'
import { dayLabel, todayDate } from '../dates'
import BudgetHeroCardSkeleton from './BudgetHeroCardSkeleton'

const GRADIENT = 'linear-gradient(152deg,#4D79F8 0%,#3461E8 100%)'
const SHADOW = '0 18px 30px -18px rgba(52,97,232,.8)'
const OVER_GRADIENT = 'linear-gradient(152deg,#F2675A 0%,#DC4437 100%)'
const OVER_SHADOW = '0 18px 30px -18px rgba(220,68,55,.8)'

export default function BudgetHeroCard() {
  const { month } = useAppContext()
  const summary = useBudgetSummary()
  const spendDay = useSpendDay()
  if (!summary || !spendDay) return <BudgetHeroCardSkeleton />
  const { remaining, totalBudget, totalSpent } = summary

  const hasBudget = totalBudget > 0
  const over = hasBudget && remaining < 0
  // Unclamped so the pill can say e.g. "125% used" once over budget.
  const pct = hasBudget ? Math.round((totalSpent / totalBudget) * 100) : 0
  // Keep a visible sliver once anything is spent, but no stray dot at zero.
  const barPct = !hasBudget || totalSpent <= 0 ? 0 : Math.max(2, Math.min(100, (totalSpent / totalBudget) * 100))

  const heroAmount = hasBudget ? Math.abs(remaining) : totalSpent
  const heroText = fmt(heroAmount)
  const heroSize = heroText.length > 9 ? 'text-[32px]' : heroText.length > 7 ? 'text-[38px]' : 'text-[44px]'
  const subLabel = !hasBudget
    ? 'spent · no budget set'
    : over
      ? `over budget of ${CURRENCY} ${fmt(totalBudget)}`
      : `remaining of ${CURRENCY} ${fmt(totalBudget)}`

  const todayExpenses = spendDay.isToday ? spendDay.expenses : []
  const todayTotal = todayExpenses.reduce((s, e) => s + e.amount, 0)
  const payers = new Set(todayExpenses.map(e => e.profile?.display_name)).size
  const countLabel = todayExpenses.length
    ? `${todayExpenses.length} transaction${todayExpenses.length > 1 ? 's' : ''} by ${payers} member${payers > 1 ? 's' : ''}`
    : 'Nothing spent yet today'

  return (
    <div className="mx-5 mt-5 rounded-3xl px-5 pt-[22px] pb-5 text-white" style={{ background: over ? OVER_GRADIENT : GRADIENT, boxShadow: over ? OVER_SHADOW : SHADOW }}>
      <div className="flex justify-between items-center gap-3">
        <span className="text-[13px] font-bold opacity-85 truncate">{MONTHS[month - 1]} {hasBudget ? 'budget' : 'spending'}</span>
        {hasBudget && (
          <span className="shrink-0 whitespace-nowrap text-[12px] font-bold rounded-full px-2.5 py-[5px]" style={{ background: 'rgba(255,255,255,.18)' }}>
            {over ? `Over · ${pct}% used` : `${pct}% used`}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2 mt-2.5 min-w-0">
        <span className="shrink-0 text-[20px] font-bold opacity-80">{CURRENCY}</span>
        <span className={`${heroSize} font-extrabold leading-none tabular-nums whitespace-nowrap`} style={{ letterSpacing: '-0.03em' }}>{heroText}</span>
      </div>
      <div className="text-[13px] font-semibold opacity-85 mt-1.5">{subLabel}</div>
      {hasBudget && (
        <div className="h-2 rounded-full mt-4 overflow-hidden" style={{ background: 'rgba(255,255,255,.22)' }}>
          <div className="h-full rounded-full" style={{ width: `${barPct}%`, background: '#fff' }} />
        </div>
      )}
      <div className="flex items-center justify-between gap-3 mt-4 rounded-2xl px-3.5 py-3" style={{ background: 'rgba(255,255,255,.14)' }}>
        <div className="min-w-0">
          <div className="text-[12px] font-bold opacity-85 truncate">Spent today · {dayLabel(todayDate())}</div>
          <div className="text-[12px] font-semibold opacity-75 mt-[3px] truncate">{countLabel}</div>
        </div>
        <div className="shrink-0 flex items-baseline gap-1 whitespace-nowrap tabular-nums">
          <span className="text-[12px] font-bold opacity-80">{CURRENCY}</span>
          <span className="text-[20px] font-extrabold">{fmt(todayTotal)}</span>
        </div>
      </div>
    </div>
  )
}
