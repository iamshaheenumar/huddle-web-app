'use client'

import { CURRENCY } from '@/lib/constants'
import { fmt } from '@/lib/format'
import { useCategoryDetail } from '../queries'
import CategoryRingSkeleton from './CategoryRingSkeleton'

const OVER = 'var(--danger)'
// The ring is a fill; the overspend figure is text, which brightens in dark mode.
const OVER_TEXT = 'var(--danger-text)'

export default function CategoryRing({ id }: { id: string }) {
  const detail = useCategoryDetail(id)
  if (!detail?.category) return <CategoryRingSkeleton />
  const { category, summary: { available, pct, pctLeft, overspent, overspendAmount, overspendPct, budgetFraction } } = detail

  const conicGradient = overspent
    ? `conic-gradient(${category.color} 0% ${budgetFraction}%, ${OVER} ${budgetFraction}% 100%)`
    : `conic-gradient(${category.color} 0% ${pct}%, var(--line) ${pct}% 100%)`

  return (
    <div className="flex justify-center pt-6 pb-2">
      <div
        className="flex items-center justify-center rounded-full"
        style={{ width: 172, height: 172, background: conicGradient, boxShadow: `0 14px 26px -14px ${overspent ? 'color-mix(in srgb, var(--danger) 50%, transparent)' : `${category.color}80`}` }}
      >
        <div
          className="rounded-full flex flex-col items-center justify-center"
          style={{ width: 134, height: 134, background: 'var(--background)' }}
        >
          {overspent ? (
            <>
              <span className="text-meta font-bold" style={{ color: 'var(--muted)' }}>Over by</span>
              <span className="text-figure font-extrabold tracking-tight mt-0.5" style={{ color: OVER_TEXT }}>{fmt(overspendAmount)}</span>
              <span className="text-label font-bold mt-0.5" style={{ color: OVER_TEXT }}>{CURRENCY} · {Math.round(overspendPct)}% over</span>
            </>
          ) : (
            <>
              <span className="text-meta font-bold" style={{ color: 'var(--muted)' }}>Available</span>
              <span className="text-figure font-extrabold tracking-tight mt-0.5" style={{ color: 'var(--ink)' }}>{fmt(Math.max(0, available))}</span>
              <span className="text-label font-bold mt-0.5" style={{ color: category.color }}>{CURRENCY} · {Math.round(pctLeft)}% left</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
