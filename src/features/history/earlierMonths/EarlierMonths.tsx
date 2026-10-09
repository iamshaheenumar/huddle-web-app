'use client'

import { useEarlierMonths } from '../queries'
import EarlierMonthsList from './EarlierMonthsList'
import EarlierMonthsSkeleton from './EarlierMonthsSkeleton'
import type { HistoryView } from '../types'

export default function EarlierMonths({ period, view }: { period?: string; view: HistoryView }) {
  const months = useEarlierMonths(period)
  if (!months) return <EarlierMonthsSkeleton />
  if (months.length === 0) return null

  return (
    <>
      <div className="px-5 pt-6">
        <span className="text-base font-extrabold" style={{ color: '#20242E' }}>Earlier months</span>
      </div>
      <EarlierMonthsList months={months} view={view} />
    </>
  )
}
