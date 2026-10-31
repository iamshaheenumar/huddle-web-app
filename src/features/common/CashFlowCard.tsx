import { fmt } from '@/lib/format'
import { INCOME_COLOR, signedNet, type CashFlow } from '@/lib/transactions'

// In / Out / Net for one month.
export default function CashFlowCard({ label, flow }: { label: string; flow: CashFlow }) {
  const cells = [
    { title: 'In', value: `+${fmt(flow.income)}`, color: INCOME_COLOR },
    { title: 'Out', value: flow.spent > 0 ? `−${fmt(flow.spent)}` : '0', color: '#20242E' },
    { title: 'Net', value: signedNet(flow.net), color: '#20242E' },
  ]
  return (
    <div className="mx-5 mt-3 rounded-2xl px-3.5 py-2.5" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
      <div className="text-[12px] font-extrabold" style={{ color: '#20242E' }}>Cash flow · {label}</div>
      <div className="grid grid-cols-3 gap-2 mt-1.5">
        {cells.map(c => (
          <div key={c.title} className="min-w-0">
            <div className="text-[10px] font-bold" style={{ color: 'var(--muted)' }}>{c.title}</div>
            <div className="text-[14px] font-extrabold tabular-nums mt-0.5 truncate" style={{ color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
