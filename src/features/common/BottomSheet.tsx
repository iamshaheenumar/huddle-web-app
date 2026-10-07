'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  open: boolean
  onClose: () => void
  // While true (e.g. a save is in flight), backdrop taps and Escape don't close the sheet.
  locked?: boolean
  labelledBy: string
  children: React.ReactNode
}

// Bottom sheet shell pinned to the app's 430px column: backdrop, drag handle,
// Escape-to-close. Content (title, actions) is up to the caller.
export default function BottomSheet({ open, onClose, locked, labelledBy, children }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !locked) onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, locked, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-center">
      <div
        className="sheet-fade absolute inset-0"
        style={{ background: 'rgba(32,36,46,.42)' }}
        onClick={() => { if (!locked) onClose() }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="sheet-up relative self-end w-full rounded-t-3xl px-5 pt-3 max-h-[92vh] overflow-y-auto"
        style={{ maxWidth: 430, background: '#F6F3EE', paddingBottom: 'max(env(safe-area-inset-bottom), 20px)', boxShadow: '0 -20px 40px -20px rgba(32,36,46,.35)' }}
      >
        <div className="mx-auto rounded-full" style={{ width: 40, height: 4, background: '#DCD6CC' }} />
        {children}
      </div>
    </div>,
    document.body,
  )
}
