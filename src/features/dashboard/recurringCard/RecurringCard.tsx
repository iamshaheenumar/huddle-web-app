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
  const amounts = [
    monthlyTotal > 0 && `${CURRENCY} ${fmt(monthlyTotal)}`,
    monthlyIncome > 0 && `+${fmt(monthlyIncome)} in`,
  ].filter(Boolean).join(' · ')

  return (
    <Link
      href="/recurring"
      className="mx-5 mt-3 flex items-center gap-[13px] rounded-[18px] px-[15px] py-3"
      style={{ background: '#fff', border: '1px solid #F0ECE4' }}
    >
      <div className="flex items-center justify-center flex-shrink-0 rounded-[12px]" style={{ width: 38, height: 38, background: '#E9F0FE', color: '#3B6FF6' }}>
        <ArrowsClockwise size={19} weight="bold" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-bold" style={{ color: '#2A2E37' }}>
          {/* "payments" while every running rule is spend; "transactions" once one is income. */}
          {activeCount} recurring {monthlyIncome > 0 ? 'transaction' : 'payment'}{activeCount === 1 ? '' : 's'}
        </div>
        <div className="text-[11px] font-semibold truncate" style={{ color: '#9A9FA8' }}>
          {amounts} / month
          {next?.next_due_date && ` · next ${nextName} on ${shortDate(next.next_due_date)}`}
        </div>
      </div>
      <CaretRight size={14} weight="bold" color="#C4C8CF" />
    </Link>
  )
}
