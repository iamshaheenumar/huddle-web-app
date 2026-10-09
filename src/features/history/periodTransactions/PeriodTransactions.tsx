'use client'

import CategoryIcon from '@/features/common/CategoryIcon'
import MemberAvatar from '@/features/common/MemberAvatar'
import SyncingBadge from '@/features/common/SyncingBadge'
import { fmt } from '@/lib/format'
import { usePeriodTransactions } from '../queries'
import DeleteTxnButton from '../deleteTxnButton/DeleteTxnButton'
import PeriodTransactionsSkeleton from './PeriodTransactionsSkeleton'

// expense_date is a plain YYYY-MM-DD; format it in UTC so the viewer's zone can't shift the day.
const dayLabel = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString('en-AE', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })

export default function PeriodTransactions({ period }: { period?: string }) {
  const days = usePeriodTransactions(period)
  if (!days) return <PeriodTransactionsSkeleton />

  if (days.length === 0) {
    return (
      <div className="mx-5 mt-4 rounded-[22px] py-[22px] text-center text-[14px] font-semibold" style={{ background: '#fff', border: '1px solid #F0ECE4', color: '#9A9FA8' }}>
        No transactions this month
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 px-5 mt-4">
      {days.map(d => (
        <div key={d.date}>
          <div className="flex items-center justify-between px-1">
            <span className="text-[13px] font-extrabold" style={{ color: '#20242E' }}>{dayLabel(d.date)}</span>
            <span className="text-[12px] font-bold tabular-nums" style={{ color: '#9A9FA8' }}>−{fmt(d.total)}</span>
          </div>
          <div className="mt-2 rounded-[22px] px-4 overflow-hidden" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
            {d.transactions.map((t, i) => {
              const payer = t.payerName.split(' ')[0]
              return (
                <div
                  key={t.id}
                  className="flex items-center gap-3 py-[13px]"
                  style={{ borderBottom: i < d.transactions.length - 1 ? '1px solid #F4F0E9' : 'none' }}
                >
                  {t.category && <CategoryIcon icon={t.category.icon} color={t.category.color} bg_color={t.category.bg_color} size={40} iconSize={20} radius={12} />}
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-bold truncate" style={{ color: '#20242E' }}>{t.note || t.categoryName}</div>
                    <div className="flex items-center gap-1.5 mt-[3px] min-w-0">
                      <MemberAvatar name={payer} color={t.payerColor} size={16} fontSize={9} />
                      <span className="text-[12px] font-semibold truncate" style={{ color: '#9A9FA8' }}>{payer} · {t.categoryName}</span>
                      {t.pending && <SyncingBadge />}
                    </div>
                  </div>
                  <span className="text-[16px] font-extrabold tabular-nums" style={{ color: '#20242E' }}>−{fmt(t.amount)}</span>
                  <DeleteTxnButton txn={t} />
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
