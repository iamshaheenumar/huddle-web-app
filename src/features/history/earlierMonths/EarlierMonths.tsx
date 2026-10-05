import { getEarlierMonths } from '../data'
import EarlierMonthsList from './EarlierMonthsList'
import type { HistoryView } from '../types'

export default async function EarlierMonths({ period, view }: { period?: string; view: HistoryView }) {
  const months = await getEarlierMonths(period)
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
