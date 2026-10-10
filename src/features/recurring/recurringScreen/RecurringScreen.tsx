'use client'

import { useState } from 'react'
import Segmented from '@/features/common/Segmented'
import RecurringHeader from '../recurringHeader/RecurringHeader'
import RecurringSummaryCard from '../recurringSummaryCard/RecurringSummaryCard'
import RecurringList, { type RecurringFilter } from '../recurringList/RecurringList'
import RecurringScreenSkeleton from './RecurringScreenSkeleton'
import { isRunning, recurringSummary, useRecurring, useRecurringCatchUp } from '../queries'

const FILTERS: { value: RecurringFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
]

export default function RecurringScreen() {
  useRecurringCatchUp()
  const rows = useRecurring()
  const [filter, setFilter] = useState<RecurringFilter>('all')

  const visible = rows?.filter(r =>
    filter === 'all' ? true : filter === 'active' ? isRunning(r) : !r.is_active)

  return (
    <div className="flex flex-col min-h-screen pb-[calc(env(safe-area-inset-bottom)+24px)]" style={{ background: '#F6F3EE' }}>
      <RecurringHeader />
      {rows && visible ? (
        <>
          <RecurringSummaryCard summary={recurringSummary(rows)} />
          <div className="mx-5 mt-4">
            <Segmented label="Show" options={FILTERS} value={filter} onChange={setFilter} track="#EDE9E2" />
          </div>
          <RecurringList rows={visible} filter={filter} />
        </>
      ) : (
        <RecurringScreenSkeleton />
      )}
    </div>
  )
}
