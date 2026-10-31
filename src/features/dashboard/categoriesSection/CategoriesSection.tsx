'use client'

import Link from 'next/link'
import { WarningCircle } from '@phosphor-icons/react'
import CategoryIcon from '@/features/common/CategoryIcon'
import { fmt } from '@/lib/format'
import { useBudgetCategories } from '../queries'
import CategoriesSectionSkeleton from './CategoriesSectionSkeleton'

// From here a category gets a "nearly used up" line under its bar.
const NEARLY_USED = 0.8

// Share of the allocation used; an unallocated category with spend sorts as over.
const usedShare = (consumed: number, allocated: number) =>
  allocated > 0 ? consumed / allocated : consumed > 0 ? Infinity : 0

export default function CategoriesSection() {
  const categories = useBudgetCategories()
  if (!categories) return <CategoriesSectionSkeleton />
  if (categories.length === 0) return null

  // The ones that need attention come first.
  const sorted = [...categories].sort((a, b) =>
    usedShare(b.consumed, b.allocated_amount) - usedShare(a.consumed, a.allocated_amount))

  return (
    <>
      <div className="flex items-baseline justify-between px-5 pt-6">
        <span className="text-section font-extrabold" style={{ color: 'var(--ink)' }}>Categories</span>
        <Link href="/budget/set" className="text-body font-bold py-2" style={{ color: 'var(--primary-text)' }}>Edit budget</Link>
      </div>
      <div className="mx-5 mt-1 rounded-[22px] py-1 px-4" style={{ background: 'var(--card)', border: '1px solid var(--hairline)' }}>
        {sorted.map((bc, i) => {
          const pct = bc.allocated_amount > 0 ? Math.min(100, Math.round((bc.consumed / bc.allocated_amount) * 100)) : 0
          const isLast = i === sorted.length - 1
          const overspent = bc.allocated_amount > 0 && bc.consumed > bc.allocated_amount
          const nearly = !overspent && bc.allocated_amount > 0 && bc.consumed / bc.allocated_amount >= NEARLY_USED
          const budgetFraction = bc.consumed > 0 ? Math.min(100, (bc.allocated_amount / bc.consumed) * 100) : 0
          const barColor = bc.category?.color ?? '#3B6FF6'
          return (
            <Link href={`/categories/${bc.category?.id}`} key={bc.category?.id ?? i}>
              <div className="flex items-center gap-3 py-3" style={{ borderBottom: isLast ? 'none' : '1px solid var(--hairline)' }}>
                {bc.category && <CategoryIcon icon={bc.category.icon} color={bc.category.color} bg_color={bc.category.bg_color} size={36} iconSize={18} radius={11} />}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-body font-bold truncate" style={{ color: 'var(--ink)' }}>{bc.category?.name}</span>
                    <span className="text-body font-bold tabular-nums shrink-0" style={{ color: 'var(--ink)' }}>{fmt(bc.consumed)} <span style={{ color: 'var(--muted)', fontWeight: 600 }}>/ {fmt(bc.allocated_amount)}</span></span>
                  </div>
                  <div className="h-1.5 rounded-full mt-2 overflow-hidden" style={{ background: 'var(--track)' }}>
                    {overspent
                      ? <div className="h-full rounded-full" style={{ width: '100%', background: `linear-gradient(to right, ${barColor} 0 ${budgetFraction}%, var(--danger) ${budgetFraction}% 100%)` }} />
                      : <div className="h-full rounded-full" style={{ width: `${pct}%`, background: barColor }} />
                    }
                  </div>
                  {/* Said in words too, so it doesn't rest on telling red from the category colour. */}
                  {overspent && (
                    <div className="flex items-center gap-1 mt-1.5 text-meta font-bold" style={{ color: 'var(--danger-text)' }}>
                      <WarningCircle size={14} weight="fill" aria-hidden="true" />
                      Over by {fmt(bc.consumed - bc.allocated_amount)}
                    </div>
                  )}
                  {nearly && (
                    <div className="mt-1.5 text-meta font-bold" style={{ color: 'var(--warning)' }}>
                      {pct}% used · {fmt(bc.allocated_amount - bc.consumed)} left
                    </div>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}
