import { Suspense } from 'react'
import HistoryScreen from '@/features/history/historyScreen/HistoryScreen'
import HistoryHeaderSkeleton from '@/features/history/historyHeader/HistoryHeaderSkeleton'
import MonthTabsSkeleton from '@/features/history/monthTabs/MonthTabsSkeleton'
import PeriodHeroCardSkeleton from '@/features/history/periodHeroCard/PeriodHeroCardSkeleton'
import PeriodTransactionsSkeleton from '@/features/history/periodTransactions/PeriodTransactionsSkeleton'

// Static shell. The screen reads ?period and ?view on the client, which needs a
// Suspense boundary so the rest of the page can still be prerendered.
export default function HistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col min-h-screen pb-24" style={{ background: '#F6F3EE' }}>
          <HistoryHeaderSkeleton />
          <MonthTabsSkeleton />
          <PeriodHeroCardSkeleton />
          <PeriodTransactionsSkeleton />
        </div>
      }
    >
      <HistoryScreen />
    </Suspense>
  )
}
