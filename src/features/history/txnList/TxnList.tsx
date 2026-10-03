import MemberAvatar from '@/features/common/MemberAvatar'
import { fmt } from '@/lib/format'
import type { HistoryTxn } from '../types'

// 'YYYY-MM-DD' parsed by parts so the day never shifts with the viewer's timezone.
const fmtDate = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-AE', { month: 'short', day: 'numeric' })
}

// `show` picks the secondary line: who paid (category view) or the category (member view).
export default function TxnList({ transactions, show }: { transactions: HistoryTxn[]; show: 'payer' | 'category' }) {
  if (transactions.length === 0) {
    return <div className="pt-3 text-[12px] font-semibold" style={{ color: '#9A9FA8' }}>No transactions this month</div>
  }
  return (
    <div className="flex flex-col gap-2 pt-3 mt-3" style={{ borderTop: '1px solid #F0ECE4' }}>
      {transactions.map(t => (
        <div key={t.id} className="flex items-center gap-2.5">
          {show === 'payer' && <MemberAvatar name={t.payerName} color={t.payerColor} size={28} fontSize={11} />}
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-bold truncate" style={{ color: '#2A2E37' }}>{t.note ?? t.categoryName}</div>
            <div className="text-[11px] font-semibold mt-0.5 truncate" style={{ color: '#9A9FA8' }}>
              {show === 'payer' ? t.payerName.split(' ')[0] : t.categoryName} · {fmtDate(t.date)}
            </div>
          </div>
          <span className="text-[13px] font-extrabold tabular-nums" style={{ color: '#20242E' }}>−{fmt(t.amount)}</span>
        </div>
      ))}
    </div>
  )
}
