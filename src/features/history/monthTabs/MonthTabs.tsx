'use client'

import Link from 'next/link'
import { MONTHS } from '@/lib/constants'
import { periodKey } from '../derive'
import { useHistoryContext } from '../queries'
import { historyHref } from '../links'
import type { HistoryView } from '../types'
import MonthTabsSkeleton from './MonthTabsSkeleton'

export default function MonthTabs({ period, view }: { period?: string; view: HistoryView }) {
  const ctx = useHistoryContext(period)
  if (!ctx) return <MonthTabsSkeleton />
  const { periods, selected } = ctx
  const selectedKey = periodKey(selected)

  return (
    <div className="flex gap-2 px-5 mt-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
      {periods.map(p => {
        const key = periodKey(p)
        const isSelected = key === selectedKey
        return (
          <Link
            key={key}
            href={historyHref(key, view)}
            scroll={false}
            className="flex-shrink-0 rounded-full px-4 py-2 text-[13px] font-bold whitespace-nowrap"
            style={isSelected
              ? { background: '#20242E', color: '#fff' }
              : { background: '#fff', color: '#3A3F49', border: '1px solid #EAE5DD' }}
          >
            {MONTHS[p.month - 1].slice(0, 3)} {p.year}
          </Link>
        )
      })}
    </div>
  )
}
