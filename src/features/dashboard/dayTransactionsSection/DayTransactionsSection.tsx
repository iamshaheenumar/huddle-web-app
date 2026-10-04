import Link from 'next/link'
import CategoryIcon from '@/features/common/CategoryIcon'
import MemberAvatar from '@/features/common/MemberAvatar'
import { fmt } from '@/lib/format'
import { getSpendDay } from '../data'
import { dayLabel, isYesterday, timeLabel } from '../dates'

// Shows today's transactions; falls back to the latest day that had spend.
export default async function DayTransactionsSection() {
  const { date, isToday, expenses } = await getSpendDay()

  const title = isToday || !date
    ? "Today's transactions"
    : isYesterday(date) ? "Yesterday's transactions" : `Transactions · ${dayLabel(date)}`

  return (
    <>
      <div className="flex items-center justify-between px-5 pt-6">
        <span className="text-[17px] font-extrabold" style={{ color: '#20242E' }}>{title}</span>
        <Link href="/history" className="text-[13px] font-bold" style={{ color: '#3B6FF6' }}>See all</Link>
      </div>
      <div className="mx-5 mt-3 rounded-[22px] py-1 px-4 overflow-hidden" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
        {date && !isToday && (
          <div className="text-[12px] font-semibold pt-3" style={{ color: '#9A9FA8' }}>Nothing spent today yet — showing your last spend.</div>
        )}
        {expenses.length === 0 ? (
          <div className="py-[22px] text-center text-[14px] font-semibold" style={{ color: '#9A9FA8' }}>No transactions yet. Tap + to add one.</div>
        ) : (
          <div className="-mb-px">
            {expenses.map(exp => {
              const payer = exp.profile?.display_name?.split(' ')[0] ?? '?'
              return (
                <div key={exp.id} className="flex items-center gap-3 py-[13px]" style={{ borderBottom: '1px solid #F4F0E9' }}>
                  {exp.category && <CategoryIcon icon={exp.category.icon} color={exp.category.color} bg_color={exp.category.bg_color} size={40} iconSize={20} radius={12} />}
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-bold truncate" style={{ color: '#20242E' }}>{exp.note || exp.category?.name || 'Expense'}</div>
                    <div className="flex items-center gap-1.5 mt-[3px] min-w-0">
                      <MemberAvatar name={payer} color={exp.profile?.avatar_color ?? '#3B6FF6'} size={16} fontSize={9} />
                      <span className="text-[12px] font-semibold truncate" style={{ color: '#9A9FA8' }}>
                        {payer}{exp.category ? ` · ${exp.category.name}` : ''} · {timeLabel(exp.created_at)}
                      </span>
                    </div>
                  </div>
                  <span className="text-[16px] font-extrabold tabular-nums" style={{ color: '#20242E' }}>−{fmt(exp.amount)}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
