import { CURRENCY } from '@/lib/constants'
import { fmt } from '@/lib/format'
import { shortDate } from '@/lib/recurring'
import type { RecurringSummary } from '../queries'

export default function RecurringSummaryCard({ summary }: { summary: RecurringSummary }) {
  const { activeCount, pausedCount, monthlyTotal, next } = summary
  return (
    <div className="mx-5 mt-[18px] rounded-[22px] px-5 py-[18px] text-white" style={{ background: 'linear-gradient(152deg,#4D79F8 0%,#3461E8 100%)' }}>
      <div className="text-[12px] font-bold opacity-85">Committed each month</div>
      <div className="flex items-baseline gap-1.5 mt-1">
        <span className="text-[13px] font-bold opacity-85">{CURRENCY}</span>
        <span className="text-[32px] font-extrabold tracking-[-.5px] leading-none tabular-nums">{fmt(monthlyTotal)}</span>
      </div>
      <div className="flex flex-wrap gap-x-[18px] gap-y-1 mt-3.5 text-[12px] font-bold">
        <span>{activeCount} active</span>
        {pausedCount > 0 && <span className="opacity-85">{pausedCount} paused</span>}
        {next?.next_due_date && <span className="opacity-85">Next: {shortDate(next.next_due_date)}</span>}
      </div>
    </div>
  )
}
