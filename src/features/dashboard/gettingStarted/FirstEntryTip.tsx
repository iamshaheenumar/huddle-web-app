'use client'

import { useEffect } from 'react'
import { useGettingStarted } from './queries'
import { markFirstEntryPending } from './firstEntry'

// A label over the bottom nav's "+" while a new account has logged nothing yet.
// Sits in the nav's own box (which is `relative`) so it tracks the button.
export default function FirstEntryTip() {
  const gs = useGettingStarted()
  const show = !!gs?.visible && !gs.hasFirstEntry

  useEffect(() => { if (show) markFirstEntryPending() }, [show])

  if (!show) return null
  return (
    <div className="tip-in pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-8 flex flex-col items-center">
      <span className="whitespace-nowrap rounded-xl px-3 py-2 text-body font-bold" style={{ background: 'var(--inverse)', color: 'var(--on-inverse)' }}>
        Log your first expense
      </span>
      <span aria-hidden="true" className="w-2.5 h-2.5 -mt-1.5 rotate-45" style={{ background: 'var(--inverse)' }} />
    </div>
  )
}
