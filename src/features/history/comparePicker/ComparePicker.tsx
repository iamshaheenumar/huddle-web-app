'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowsLeftRight, CaretDown, Check } from '@phosphor-icons/react'
import BottomSheet from '@/features/common/BottomSheet'
import { MONTHS } from '@/lib/constants'
import { periodKey, periodLabel } from '../derive'
import { compareHref } from '../links'
import { useComparePeriods } from '../queries'
import type { Period } from '../types'
import ComparePickerSkeleton from './ComparePickerSkeleton'

type Side = 'a' | 'b'

// "Nov 2026": the full name doesn't fit two pills across a phone.
const pillLabel = (p: Period) => `${MONTHS[p.month - 1].slice(0, 3)} ${p.year}`

// The two months side by side: tap either to change it, or swap them.
export default function ComparePicker({ a, b }: { a?: string; b?: string }) {
  const router = useRouter()
  const pair = useComparePeriods(a, b)
  const [picking, setPicking] = useState<Side | null>(null)
  if (!pair) return <ComparePickerSkeleton />

  const aKey = periodKey(pair.a)
  const bKey = periodKey(pair.b)
  const chosen = picking === 'a' ? aKey : bKey
  const other = picking === 'a' ? bKey : aKey

  const pick = (key: string) => {
    setPicking(null)
    router.replace(picking === 'a' ? compareHref(key, bKey) : compareHref(aKey, key), { scroll: false })
  }

  const pill = (side: Side, p: Period) => (
    <button
      type="button"
      onClick={() => setPicking(side)}
      aria-label={`${side === 'a' ? 'First' : 'Second'} month: ${periodLabel(p)}. Change`}
      className="flex-1 min-w-0 flex items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-body font-bold"
      style={{ background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--ink)' }}
    >
      <span className="truncate">{pillLabel(p)}</span>
      <CaretDown size={13} weight="bold" style={{ color: 'var(--icon-subtle)', flexShrink: 0 }} />
    </button>
  )

  return (
    <>
      <div className="flex items-center gap-2 px-5 mt-5">
        {pill('a', pair.a)}
        <Link
          href={compareHref(bKey, aKey)}
          replace
          scroll={false}
          aria-label="Swap months"
          className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'var(--inverse)', color: 'var(--on-inverse)' }}
        >
          <ArrowsLeftRight size={17} weight="bold" />
        </Link>
        {pill('b', pair.b)}
      </div>

      <BottomSheet open={picking !== null} onClose={() => setPicking(null)} labelledBy="compare-month-title">
        <div id="compare-month-title" className="text-section font-extrabold mt-4" style={{ color: 'var(--ink)' }}>
          {picking === 'a' ? 'First month' : 'Compare with'}
        </div>
        <div className="flex flex-col gap-2 mt-3">
          {pair.periods.map(p => {
            const key = periodKey(p)
            const isChosen = key === chosen
            const isOther = key === other
            return (
              <button
                key={key}
                type="button"
                disabled={isOther}
                onClick={() => pick(key)}
                className="flex items-center justify-between rounded-[16px] px-4 py-3 text-row font-bold disabled:opacity-50"
                style={isChosen
                  ? { background: 'var(--primary-soft)', border: '1px solid var(--primary-line)', color: 'var(--primary-text)' }
                  : { background: 'var(--card)', border: '1px solid var(--hairline)', color: 'var(--ink)' }}
              >
                {periodLabel(p)}
                {isChosen && <Check size={16} weight="bold" />}
                {isOther && <span className="text-meta font-semibold" style={{ color: 'var(--muted)' }}>Other month</span>}
              </button>
            )
          })}
        </div>
      </BottomSheet>
    </>
  )
}
