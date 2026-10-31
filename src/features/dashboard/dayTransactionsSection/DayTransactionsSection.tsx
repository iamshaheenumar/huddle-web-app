'use client'

import Link from 'next/link'
import CategoryIcon from '@/features/common/CategoryIcon'
import MemberAvatar from '@/features/common/MemberAvatar'
import IncomeIcon from '@/features/common/IncomeIcon'
import { INCOME_COLOR, isIncome, signedAmount } from '@/lib/transactions'
import { CURRENCY } from '@/lib/constants'
import { fmt } from '@/lib/format'
import { useSpendDay } from '../queries'
import { dayLabel, isYesterday, timeLabel } from '../dates'
import DayTransactionsSectionSkeleton from './DayTransactionsSectionSkeleton'
import SyncingBadge from '@/features/common/SyncingBadge'

// Shows today's transactions; falls back to the latest day that had any.
export default function DayTransactionsSection() {
  const spendDay = useSpendDay()
  if (!spendDay) return <DayTransactionsSectionSkeleton />
  const { date, isToday, expenses } = spendDay

  const title = isToday || !date ? 'Today' : isYesterday(date) ? 'Yesterday' : dayLabel(date)
  // The day's spend lives here (not in the hero), next to the list it sums.
  const spent = expenses.filter(e => !isIncome(e)).reduce((s, e) => s + e.amount, 0)

  return (
    <>
      <div className="flex items-baseline justify-between gap-3 px-5 pt-6">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="text-[17px] font-extrabold" style={{ color: 'var(--ink)' }}>{title}</span>
          {spent > 0 && (
            <span className="text-[13px] font-semibold tabular-nums truncate" style={{ color: 'var(--muted)' }}>{CURRENCY} {fmt(spent)} spent</span>
          )}
        </div>
        <Link href="/history" className="shrink-0 text-[13px] font-bold py-2" style={{ color: 'var(--primary)' }}>See all</Link>
      </div>
      <div className="mx-5 mt-3 rounded-[22px] py-1 px-4 overflow-hidden" style={{ background: '#fff', border: '1px solid var(--hairline)' }}>
        {date && !isToday && (
          <div className="text-[12px] font-semibold pt-3" style={{ color: 'var(--muted)' }}>Nothing logged today yet — showing your last transactions.</div>
        )}
        {expenses.length === 0 ? (
          <div className="py-[22px] text-center text-[14px] font-semibold" style={{ color: 'var(--muted)' }}>No transactions yet. Tap + to add one.</div>
        ) : (
          expenses.map((exp, i) => {
            const payer = exp.profile?.display_name?.split(' ')[0] ?? '?'
            const isLast = i === expenses.length - 1
            const income = isIncome(exp)
            const label = income ? 'Income' : exp.category?.name
            return (
              <div key={exp.id} className="flex items-center gap-3 py-[13px]" style={{ borderBottom: isLast ? 'none' : '1px solid var(--hairline)' }}>
                {income
                  ? <IncomeIcon size={40} iconSize={20} radius={12} />
                  : exp.category && <CategoryIcon icon={exp.category.icon} color={exp.category.color} bg_color={exp.category.bg_color} size={40} iconSize={20} radius={12} />}
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-bold truncate" style={{ color: 'var(--ink)' }}>{exp.note || label || 'Expense'}</div>
                  <div className="flex items-center gap-1.5 mt-[3px] min-w-0">
                    <MemberAvatar name={payer} color={exp.profile?.avatar_color ?? '#3B6FF6'} size={16} fontSize={9} />
                    <span className="text-[12px] font-semibold truncate" style={{ color: 'var(--muted)' }}>
                      {payer}{label ? ` · ${label}` : ''} · {exp.recurring ? 'Recurring' : timeLabel(exp.created_at)}
                    </span>
                    {exp.pending && <SyncingBadge />}
                  </div>
                </div>
                <span className="text-[16px] font-extrabold tabular-nums" style={{ color: income ? INCOME_COLOR : 'var(--ink)' }}>{signedAmount(exp)}</span>
              </div>
            )
          })
        )}
      </div>
    </>
  )
}
