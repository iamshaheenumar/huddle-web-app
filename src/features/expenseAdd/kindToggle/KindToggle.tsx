'use client'

import { Minus, Plus } from '@phosphor-icons/react'
import type { TxnKind } from '@/types'

const OPTIONS: { value: TxnKind; label: string; Icon: typeof Plus; color: string }[] = [
  { value: 'expense', label: 'Expense', Icon: Minus, color: 'var(--ink)' },
  { value: 'income', label: 'Income', Icon: Plus, color: 'var(--income)' },
]

// Expense | Income switch at the top of the add screen.
export default function KindToggle({ value, onChange }: { value: TxnKind; onChange: (kind: TxnKind) => void }) {
  return (
    <div role="radiogroup" aria-label="Transaction type" className="mx-5 mt-4 grid grid-cols-2 gap-1 rounded-[13px] p-1" style={{ background: 'var(--track)' }}>
      {OPTIONS.map(({ value: v, label, Icon, color }) => {
        const selected = v === value
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(v)}
            className="flex items-center justify-center gap-1.5 py-2 rounded-[10px] text-[13px] transition-colors"
            style={selected
              ? { background: '#fff', color, fontWeight: 800, boxShadow: '0 1px 3px rgba(32,36,46,.08)' }
              : { color: 'var(--ink-2)', fontWeight: 700 }}
          >
            <Icon size={13} weight="bold" />
            {label}
          </button>
        )
      })}
    </div>
  )
}
