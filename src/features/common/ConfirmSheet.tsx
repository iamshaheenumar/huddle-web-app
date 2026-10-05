'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel: string
  pendingLabel?: string
  pending?: boolean
  error?: string | null
  icon?: React.ReactNode
  children?: React.ReactNode
}

// Bottom sheet confirmation, pinned to the app's 430px column. Destructive styling only —
// the one place it's used today is deletes.
export default function ConfirmSheet({ open, onClose, onConfirm, title, description, confirmLabel, pendingLabel, pending, error, icon, children }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !pending) onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, pending, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-center">
      <div
        className="sheet-fade absolute inset-0"
        style={{ background: 'rgba(32,36,46,.42)' }}
        onClick={() => { if (!pending) onClose() }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-sheet-title"
        className="sheet-up relative self-end w-full rounded-t-3xl px-5 pt-3"
        style={{ maxWidth: 430, background: '#F6F3EE', paddingBottom: 'max(env(safe-area-inset-bottom), 20px)', boxShadow: '0 -20px 40px -20px rgba(32,36,46,.35)' }}
      >
        <div className="mx-auto rounded-full" style={{ width: 40, height: 4, background: '#DCD6CC' }} />

        <div className="flex flex-col items-center text-center pt-5">
          {icon && (
            <div className="flex items-center justify-center rounded-[18px]" style={{ width: 52, height: 52, background: '#FBE8E1', color: '#E5683E' }}>
              {icon}
            </div>
          )}
          <div id="confirm-sheet-title" className="text-[18px] font-extrabold mt-3.5" style={{ color: '#20242E' }}>{title}</div>
          {description && <p className="text-[13px] font-semibold mt-1.5 px-4" style={{ color: '#9A9FA8' }}>{description}</p>}
        </div>

        {children && <div className="mt-4">{children}</div>}

        {error && <p className="text-xs font-semibold rounded-xl px-3 py-2 mt-3" style={{ color: '#E0563E', background: '#FBE7E1' }}>{error}</p>}

        <div className="flex flex-col gap-2.5 mt-5">
          <button
            onClick={onConfirm}
            disabled={pending}
            autoFocus
            className="w-full rounded-[17px] py-4 text-base font-extrabold text-white transition-opacity disabled:opacity-60"
            style={{ background: '#E0563E', boxShadow: '0 14px 24px -10px rgba(224,86,62,.65)' }}
          >
            {pending ? (pendingLabel ?? confirmLabel) : confirmLabel}
          </button>
          <button
            onClick={onClose}
            disabled={pending}
            className="w-full rounded-[17px] py-3.5 text-[15px] font-bold disabled:opacity-60"
            style={{ background: '#fff', border: '1px solid #EAE5DD', color: '#3A3F49' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
