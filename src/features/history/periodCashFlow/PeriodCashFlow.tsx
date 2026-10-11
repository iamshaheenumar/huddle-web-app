'use client'

import CashFlowCard from '@/features/common/CashFlowCard'
import { MONTHS } from '@/lib/constants'
import { usePeriodCashFlow } from '../queries'

// The selected month's money in vs out. Only shown when that month has income,
// so months that only logged spend look as before. No skeleton, as it's usually absent.
export default function PeriodCashFlow({ period }: { period?: string }) {
  const data = usePeriodCashFlow(period)
  if (!data || data.flow.income <= 0) return null
  return <CashFlowCard label={MONTHS[data.period.month - 1]} flow={data.flow} />
}
