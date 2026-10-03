import { getEarlierMonths } from '../data'
import EarlierMonthsList from './EarlierMonthsList'

export default async function EarlierMonths({ period }: { period?: string }) {
  const months = await getEarlierMonths(period)
  if (months.length === 0) return null

  return (
    <>
      <div className="px-5 pt-6">
        <span className="text-base font-extrabold" style={{ color: '#20242E' }}>Earlier months</span>
      </div>
      <EarlierMonthsList months={months} />
    </>
  )
}
