import { Suspense } from 'react'
import HistoryHeader from '@/features/history/historyHeader/HistoryHeader'
import HistoryHeaderSkeleton from '@/features/history/historyHeader/HistoryHeaderSkeleton'
import MonthTabs from '@/features/history/monthTabs/MonthTabs'
import MonthTabsSkeleton from '@/features/history/monthTabs/MonthTabsSkeleton'
import PeriodHeroCard from '@/features/history/periodHeroCard/PeriodHeroCard'
import PeriodHeroCardSkeleton from '@/features/history/periodHeroCard/PeriodHeroCardSkeleton'
import ViewTabs from '@/features/history/viewTabs/ViewTabs'
import PeriodTransactions from '@/features/history/periodTransactions/PeriodTransactions'
import PeriodTransactionsSkeleton from '@/features/history/periodTransactions/PeriodTransactionsSkeleton'
import MemberSpend from '@/features/history/memberSpend/MemberSpend'
import MemberSpendSkeleton from '@/features/history/memberSpend/MemberSpendSkeleton'
import CategoryBreakdown from '@/features/history/categoryBreakdown/CategoryBreakdown'
import CategoryBreakdownSkeleton from '@/features/history/categoryBreakdown/CategoryBreakdownSkeleton'
import EarlierMonths from '@/features/history/earlierMonths/EarlierMonths'
import EarlierMonthsSkeleton from '@/features/history/earlierMonths/EarlierMonthsSkeleton'
import { parseView } from '@/features/history/links'

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ period?: string; view?: string }> }) {
  const { period, view: viewParam } = await searchParams
  const view = parseView(viewParam)

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#F6F3EE' }}>
      <Suspense fallback={<HistoryHeaderSkeleton />}>
        <HistoryHeader period={period} />
      </Suspense>
      <Suspense fallback={<MonthTabsSkeleton />}>
        <MonthTabs period={period} view={view} />
      </Suspense>
      <Suspense fallback={<PeriodHeroCardSkeleton />}>
        <PeriodHeroCard period={period} />
      </Suspense>
      <ViewTabs period={period} view={view} />
      {view === 'transactions' && (
        <Suspense fallback={<PeriodTransactionsSkeleton />}>
          <PeriodTransactions period={period} />
        </Suspense>
      )}
      {view === 'categories' && (
        <Suspense fallback={<CategoryBreakdownSkeleton />}>
          <CategoryBreakdown period={period} />
        </Suspense>
      )}
      {view === 'members' && (
        <Suspense fallback={<MemberSpendSkeleton />}>
          <MemberSpend period={period} />
        </Suspense>
      )}
      <Suspense fallback={<EarlierMonthsSkeleton />}>
        <EarlierMonths period={period} view={view} />
      </Suspense>
    </div>
  )
}
