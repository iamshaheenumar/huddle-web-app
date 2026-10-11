'use client'

import CashFlowCard from '@/features/common/CashFlowCard'
import { MONTHS } from '@/lib/constants'
import { useAppContext } from '@/features/common/queries'
import { useMonthCashFlow } from '../queries'

// This month's money in vs out. Only shown once the month has income, so groups
// that only log spend see no change. No skeleton, as it's usually absent.
export default function CashFlowSection() {
  const { month } = useAppContext()
  const flow = useMonthCashFlow()
  if (!flow || flow.income <= 0) return null
  return <CashFlowCard label={MONTHS[month - 1]} flow={flow} />
}
