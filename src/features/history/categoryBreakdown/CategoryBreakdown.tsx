'use client'

import CategoryIcon from '@/features/common/CategoryIcon'
import { fmt } from '@/lib/format'
import { usePeriodCategories } from '../queries'
import TxnList from '../txnList/TxnList'
import CategoryBreakdownSkeleton from './CategoryBreakdownSkeleton'

export default function CategoryBreakdown({ period }: { period?: string }) {
  const categories = usePeriodCategories(period)
  if (!categories) return <CategoryBreakdownSkeleton />
  if (categories.length === 0) {
    return (
      <div className="mx-5 mt-4 rounded-[22px] py-[22px] text-center text-[14px] font-semibold" style={{ background: '#fff', border: '1px solid #F0ECE4', color: '#9A9FA8' }}>
        No category spend this month
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5 px-5 mt-4">
      {categories.map(c => {
        const hasAllocation = c.allocated > 0
        const overspent = hasAllocation && c.consumed > c.allocated
        const pct = hasAllocation ? Math.min(100, Math.round((c.consumed / c.allocated) * 100)) : (c.consumed > 0 ? 100 : 0)
        // budgetFraction = share of the filled bar that is in-budget (used to draw the red overspend segment)
        const budgetFraction = c.consumed > 0 ? Math.min(100, (c.allocated / c.consumed) * 100) : 0
        const barColor = c.category.color
        return (
          <details key={c.category.id} className="group rounded-[20px] p-4" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
            <summary className="flex items-center gap-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <CategoryIcon icon={c.category.icon} color={c.category.color} bg_color={c.category.bg_color} size={38} iconSize={19} radius={12} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[14px] font-bold" style={{ color: '#2A2E37' }}>{c.category.name}</span>
                  {overspent
                    ? <span className="text-[11px] font-bold rounded-full px-2.5 py-1 shrink-0" style={{ background: '#FBE8E1', color: '#E5683E' }}>Over by {fmt(c.consumed - c.allocated)}</span>
                    : hasAllocation
                      ? <span className="text-[13px] font-bold tabular-nums shrink-0" style={{ color: '#20242E' }}>{fmt(c.consumed)} <span style={{ color: '#B6BAC1', fontWeight: 600 }}>/ {fmt(c.allocated)}</span></span>
                      : <span className="text-[13px] font-bold tabular-nums shrink-0" style={{ color: '#20242E' }}>{fmt(c.consumed)}</span>}
                </div>
                <div className="h-1.5 rounded-full mt-2.5 overflow-hidden" style={{ background: '#EFEBE3' }}>
                  {overspent
                    ? <div className="h-full rounded-full" style={{ width: '100%', background: `linear-gradient(to right, ${barColor} 0 ${budgetFraction}%, #E0563E ${budgetFraction}% 100%)` }} />
                    : <div className="h-full rounded-full" style={{ width: `${pct}%`, background: barColor }} />}
                </div>
              </div>
              <svg className="shrink-0 transition-transform group-open:rotate-90" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C6C2B9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            </summary>
            <TxnList transactions={c.transactions} show="payer" />
          </details>
        )
      })}
    </div>
  )
}
