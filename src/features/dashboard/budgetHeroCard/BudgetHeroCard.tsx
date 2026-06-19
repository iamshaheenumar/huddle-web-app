import { MONTHS, CURRENCY } from '@/lib/constants'
import { fmt } from '@/lib/format'
import { getBudgetSummary } from '../data'

export default async function BudgetHeroCard() {
  const { month, remaining, totalBudget, totalSpent, pctUsed } = await getBudgetSummary()

  return (
    <div className="mx-5 mt-4 rounded-3xl p-5 text-white" style={{ background: 'linear-gradient(152deg,#4D79F8 0%,#3461E8 100%)', boxShadow: '0 20px 34px -16px rgba(52,97,232,.6)' }}>
      <div className="flex justify-between items-center">
        <span className="text-[13px] font-semibold opacity-90">{MONTHS[month - 1]} budget</span>
        <span className="text-[11px] font-bold rounded-full px-3 py-1" style={{ background: 'rgba(255,255,255,.2)' }}>{pctUsed}% used</span>
      </div>
      <div className="text-[36px] font-extrabold mt-3 tracking-tight leading-none">
        {CURRENCY} {fmt(remaining)}
      </div>
      <div className="text-[13px] opacity-85 mt-0.5">remaining of {CURRENCY} {fmt(totalBudget)}</div>
      <div className="h-2.5 rounded-full mt-4 overflow-hidden" style={{ background: 'rgba(255,255,255,.26)' }}>
        <div className="h-full rounded-full" style={{ width: `${pctUsed}%`, background: '#fff' }} />
      </div>
      <div className="flex justify-between mt-3 text-[12px] font-semibold opacity-90">
        <span>Spent {CURRENCY} {fmt(totalSpent)}</span>
        <span>Left {CURRENCY} {fmt(remaining)}</span>
      </div>
    </div>
  )
}
