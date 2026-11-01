'use client'

import { useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { Confetti } from '@phosphor-icons/react'
import BottomSheet from '@/features/common/BottomSheet'
import { useAppContext } from '@/features/common/queries'
import { CURRENCY } from '@/lib/constants'
import { fmt } from '@/lib/format'
import { useBudget, useSpendDay } from '../queries'
import { clearFirstEntryPending, isFirstEntryPending } from './firstEntry'

const noSubscribe = () => () => {}

// Shown once, back on Home after the first entry made while the "+" tip was
// up: what just changed and where to see it.
export default function FirstEntrySheet({ ready }: { ready: boolean }) {
  const { group } = useAppContext()
  const day = useSpendDay()
  const { data: budget } = useBudget()
  // False on the server and the first client render, so hydration matches.
  const pending = useSyncExternalStore(noSubscribe, isFirstEntryPending, () => false)
  const [closed, setClosed] = useState(false)
  const entry = day?.expenses[0]

  function close() {
    clearFirstEntryPending()
    setClosed(true)
  }

  const income = entry?.kind === 'income'
  return (
    <BottomSheet open={ready && pending && !closed && !!entry} onClose={close} labelledBy="first-entry-title">
      <div className="pt-5 pb-2">
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'var(--primary-soft)', color: 'var(--primary-text)' }}>
          <Confetti size={28} weight="bold" aria-hidden="true" />
        </div>
        <h2 id="first-entry-title" className="mt-4 text-title font-extrabold tracking-tight" style={{ color: 'var(--ink)' }}>First one logged</h2>
        {entry && (
          <p className="mt-1.5 text-row font-medium leading-normal" style={{ color: 'var(--ink-2)' }}>
            {income
              ? <>{CURRENCY} {fmt(entry.amount)} is in {group?.name}&apos;s cash flow for the month. </>
              : budget
                ? <>{CURRENCY} {fmt(entry.amount)} came off {group?.name}&apos;s budget, and the daily number on Home already counts it. </>
                : <>{CURRENCY} {fmt(entry.amount)} is in {group?.name}&apos;s spending for the month. </>}
            Everyone in the group sees it too.
          </p>
        )}
        <button
          type="button"
          onClick={close}
          className="mt-6 w-full min-h-14 rounded-[17px] text-row font-extrabold text-white"
          style={{ background: 'var(--primary)' }}
        >
          Got it
        </button>
        <Link href="/history" onClick={clearFirstEntryPending} className="mt-2 flex items-center justify-center min-h-12 text-body font-bold" style={{ color: 'var(--primary-text)' }}>
          See it in History
        </Link>
      </div>
    </BottomSheet>
  )
}
