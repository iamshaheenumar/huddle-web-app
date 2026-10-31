import { CURRENCY } from '@/lib/constants'
import { fmt } from '@/lib/format'
import { shortDate } from '@/lib/recurring'
import { HERO_FILL, HERO_SOFT } from '@/features/common/heroCard'
import type { RecurringSummary } from '../queries'

export default function RecurringSummaryCard({ summary }: { summary: RecurringSummary }) {
  const { activeCount, pausedCount, monthlyTotal, monthlyIncome, next } = summary
  return (
    <div className="mx-5 mt-[18px] rounded-3xl px-5 py-[18px] text-white" style={{ background: HERO_FILL }}>
      <div className="text-meta font-bold" style={{ color: HERO_SOFT }}>Committed each month</div>
      <div className="flex items-baseline gap-1.5 mt-1">
        <span className="text-body font-bold" style={{ color: HERO_SOFT }}>{CURRENCY}</span>
        <span className="text-figure font-extrabold tracking-[-.5px] leading-none tabular-nums">{fmt(monthlyTotal)}</span>
      </div>
      <div className="flex flex-wrap gap-x-[18px] gap-y-1 mt-3.5 text-meta font-bold">
        <span>{activeCount} active</span>
        {monthlyIncome > 0 && <span>+{fmt(monthlyIncome)} in / month</span>}
        {pausedCount > 0 && <span style={{ color: HERO_SOFT }}>{pausedCount} paused</span>}
        {next?.next_due_date && <span style={{ color: HERO_SOFT }}>Next: {shortDate(next.next_due_date)}</span>}
      </div>
    </div>
  )
}
