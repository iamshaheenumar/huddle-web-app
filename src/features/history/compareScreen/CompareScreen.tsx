'use client'

import { useSearchParams } from 'next/navigation'
import CompareHeader from '../compareHeader/CompareHeader'
import ComparePicker from '../comparePicker/ComparePicker'
import CompareSummary from '../compareSummary/CompareSummary'
import CompareList from '../compareList/CompareList'

// Reads the two months from ?a and ?b; missing or invalid ones fall back to the
// latest month and the one before it.
export default function CompareScreen() {
  const params = useSearchParams()
  const a = params.get('a') ?? undefined
  const b = params.get('b') ?? undefined

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: 'var(--background)' }}>
      <CompareHeader a={a} />
      <ComparePicker a={a} b={b} />
      <CompareSummary a={a} b={b} />
      <CompareList a={a} b={b} />
    </div>
  )
}
