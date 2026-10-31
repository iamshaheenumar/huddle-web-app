'use client'

import { fmt } from '@/lib/format'
import { useCategoryDetail } from '../queries'
import CategoryStatsSkeleton from './CategoryStatsSkeleton'

export default function CategoryStats({ id }: { id: string }) {
  const detail = useCategoryDetail(id)
  if (!detail?.category) return <CategoryStatsSkeleton />
  const { category, summary: { allocated, totalConsumed, available, overspent, overspendAmount } } = detail

  const stats = [
    { label: 'Budget', value: fmt(allocated), color: 'var(--ink)' },
    { label: 'Consumed', value: fmt(totalConsumed), color: category.color },
    overspent
      ? { label: 'Over by', value: fmt(overspendAmount), color: 'var(--danger-text)' }
      : { label: 'Available', value: fmt(Math.max(0, available)), color: 'var(--ink)' },
  ]

  return (
    <div className="mx-5 mt-3.5 flex gap-2.5">
      {stats.map(s => (
        <div key={s.label} className="flex-1 rounded-2xl p-3.5 text-center" style={{ background: 'var(--card)', border: '1px solid var(--hairline)' }}>
          <div className="text-label font-bold" style={{ color: 'var(--muted)' }}>{s.label}</div>
          <div className="text-section font-extrabold mt-0.5" style={{ color: s.color }}>{s.value}</div>
        </div>
      ))}
    </div>
  )
}
