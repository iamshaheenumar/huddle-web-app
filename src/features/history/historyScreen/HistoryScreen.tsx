'use client'

import { useSearchParams } from 'next/navigation'
import HistoryHeader from '../historyHeader/HistoryHeader'
import MonthTabs from '../monthTabs/MonthTabs'
import PeriodHeroCard from '../periodHeroCard/PeriodHeroCard'
import ViewTabs from '../viewTabs/ViewTabs'
import PeriodTransactions from '../periodTransactions/PeriodTransactions'
import CategoryBreakdown from '../categoryBreakdown/CategoryBreakdown'
import MemberSpend from '../memberSpend/MemberSpend'
import EarlierMonths from '../earlierMonths/EarlierMonths'
import { parseView } from '../links'

// Reads the selected month and tab from the URL; every section reads the
// client query cache and shows its own skeleton until it has data.
export default function HistoryScreen() {
  const params = useSearchParams()
  const period = params.get('period') ?? undefined
  const view = parseView(params.get('view') ?? undefined)

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#F6F3EE' }}>
      <HistoryHeader />
      <MonthTabs period={period} view={view} />
      <PeriodHeroCard period={period} />
      <ViewTabs period={period} view={view} />
      {view === 'transactions' && <PeriodTransactions period={period} />}
      {view === 'categories' && <CategoryBreakdown period={period} />}
      {view === 'members' && <MemberSpend period={period} />}
      <EarlierMonths period={period} view={view} />
    </div>
  )
}
