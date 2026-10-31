'use client'

import Link from 'next/link'
import { ArrowsClockwise, CaretRight } from '@phosphor-icons/react'
import { CURRENCY } from '@/lib/constants'
import { fmt } from '@/lib/format'
import { shortDate } from '@/lib/recurring'
import { isIncome } from '@/lib/transactions'
import { useRecurringCatchUp, useRecurringSummary } from '@/features/recurring/queries'

// Links to the recurring payments screen. Only shown when the group has
// payments still running, so nothing is rendered while it loads either.
export default function RecurringCard() {
  useRecurringCatchUp()
  const summary = useRecurringSummary()
  if (!summary || summary.activeCount === 0) return null
  const { activeCount, monthlyTotal, monthlyIncome, next } = summary
  const nextName = next ? next.note || next.categories?.name || (isIncome(next) ? 'income' : 'payment') : null
  // The money first ("AED 2,150 · +12,000 in a month"), then what's coming next.
  const amounts = [
    monthlyTotal > 0 && `${CURRENCY} ${fmt(monthlyTotal)}`,
    monthlyIncome > 0 && `+${fmt(monthlyIncome)} in`,
  ].filter(Boolean).join(' · ')
  const details = [
    next?.next_due_date && `Next: ${nextName} on ${shortDate(next.next_due_date)}`,
    `${activeCount} active`,
  ].filter(Boolean).join(' · ')

  return (
    <Link
      href="/recurring"
      className="mx-5 mt-3 flex items-center gap-3 rounded-[18px] px-3.5 py-3"
      style={{ background: 'var(--card)', border: '1px solid var(--hairline)' }}
    >
      <div className="flex items-center justify-center flex-shrink-0 rounded-[12px]" style={{ width: 38, height: 38, background: 'var(--primary-soft)', color: 'var(--primary-text)' }}>
        <ArrowsClockwise size={19} weight="bold" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-body font-bold truncate" style={{ color: 'var(--ink)' }}>Recurring · {amounts} a month</div>
        <div className="text-meta font-medium mt-0.5 truncate" style={{ color: 'var(--muted)' }}>{details}</div>
      </div>
      <CaretRight size={16} weight="bold" style={{ color: 'var(--icon-subtle)' }} aria-hidden="true" />
    </Link>
  )
}
