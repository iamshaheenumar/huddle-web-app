import { CURRENCY } from '@/lib/constants'
import { fmt } from '@/lib/format'
import { getPeriodSummary } from '../data'

export default async function PeriodHeroCard({ period }: { period?: string }) {
  const s = await getPeriodSummary(period)
  const barColor = s.overspent ? '#F0876A' : '#4FD08A'
  const barWidth = s.overspent ? 100 : (s.hasBudget ? Math.min(100, Math.round((s.totalSpent / s.totalBudget) * 100)) : 0)
  const statusColor = s.overspent ? '#F0876A' : '#5FD69A'

  return (
    <div className="mx-5 mt-4 rounded-3xl p-5" style={{ background: '#20242E', boxShadow: '0 20px 34px -20px rgba(32,36,46,.6)' }}>
      <div className="flex items-center gap-2">
        <span className="text-[16px] font-extrabold text-white">{s.label}</span>
        <span
          className="text-[10px] font-extrabold tracking-wide rounded-full px-2 py-0.5"
          style={s.closed
            ? { background: 'rgba(95,214,154,.15)', color: '#5FD69A' }
            : { background: 'rgba(127,169,255,.16)', color: '#7FA9FF' }}
        >
          {s.closed ? 'CLOSED' : 'ACTIVE'}
        </span>
        {s.hasBudget && (
          <span className="ml-auto text-[11px] font-bold rounded-full px-2.5 py-1" style={{ background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.72)' }}>
            {s.pctUsed}% used
          </span>
        )}
      </div>

      <div className="flex items-end justify-between mt-4">
        <div>
          <div className="text-[12px] font-semibold" style={{ color: 'rgba(255,255,255,.5)' }}>Total spent</div>
          <div className="text-[30px] font-extrabold text-white leading-none mt-1.5 tracking-tight">{CURRENCY} {fmt(s.totalSpent)}</div>
        </div>
        {s.hasBudget && (
          <div className="text-right">
            <div className="text-[12px] font-semibold" style={{ color: 'rgba(255,255,255,.5)' }}>Budget</div>
            <div className="text-[18px] font-extrabold text-white mt-1.5">{fmt(s.totalBudget)}</div>
          </div>
        )}
      </div>

      {s.hasBudget && (
        <div className="h-2.5 rounded-full mt-4 overflow-hidden" style={{ background: 'rgba(255,255,255,.15)' }}>
          <div className="h-full rounded-full" style={{ width: `${barWidth}%`, background: barColor }} />
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <span className="flex items-center gap-1.5 text-[12px] font-bold" style={{ color: s.hasBudget ? statusColor : 'rgba(255,255,255,.55)' }}>
          {s.hasBudget && !s.overspent && (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.2 14.2l-4.5-4.5 1.4-1.4 3.1 3.1 6.1-6.1 1.4 1.4-7.5 7.5z" /></svg>
          )}
          {s.hasBudget
            ? (s.overspent ? `Over budget by ${fmt(Math.abs(s.remaining))}` : `Under budget by ${fmt(s.remaining)}`)
            : 'No budget set'}
        </span>
        <span className="text-[12px] font-semibold" style={{ color: 'rgba(255,255,255,.55)' }}>
          {s.memberCount} member{s.memberCount === 1 ? '' : 's'}
        </span>
      </div>
    </div>
  )
}
