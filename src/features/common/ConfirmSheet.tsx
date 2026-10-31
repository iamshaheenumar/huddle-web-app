'use client'

import BottomSheet from './BottomSheet'

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

// Bottom sheet confirmation. Destructive styling only — the one place it's
// used today is deletes.
export default function ConfirmSheet({ open, onClose, onConfirm, title, description, confirmLabel, pendingLabel, pending, error, icon, children }: Props) {
  return (
    <BottomSheet open={open} onClose={onClose} locked={pending} labelledBy="confirm-sheet-title">
      <div className="flex flex-col items-center text-center pt-5">
        {icon && (
          <div className="flex items-center justify-center rounded-[18px]" style={{ width: 52, height: 52, background: '#FBE8E1', color: 'var(--danger)' }}>
            {icon}
          </div>
        )}
        <div id="confirm-sheet-title" className="text-section font-extrabold mt-3.5" style={{ color: 'var(--ink)' }}>{title}</div>
        {description && <p className="text-meta font-medium mt-1.5 px-4" style={{ color: 'var(--muted)' }}>{description}</p>}
      </div>

      {children && <div className="mt-4">{children}</div>}

      {error && <p className="text-meta font-semibold rounded-xl px-3 py-2 mt-3" style={{ color: 'var(--danger)', background: 'var(--danger-soft)' }}>{error}</p>}

      <div className="flex flex-col gap-2.5 mt-5">
        <button
          onClick={onConfirm}
          disabled={pending}
          autoFocus
          className="w-full rounded-[17px] py-4 text-row font-extrabold text-white transition-opacity disabled:opacity-60"
          style={{ background: 'var(--danger)', boxShadow: '0 14px 24px -10px rgba(224,86,62,.65)' }}
        >
          {pending ? (pendingLabel ?? confirmLabel) : confirmLabel}
        </button>
        <button
          onClick={onClose}
          disabled={pending}
          className="w-full rounded-[17px] py-3.5 text-row font-bold disabled:opacity-60"
          style={{ background: '#fff', border: '1px solid var(--line)', color: 'var(--ink)' }}
        >
          Cancel
        </button>
      </div>
    </BottomSheet>
  )
}
