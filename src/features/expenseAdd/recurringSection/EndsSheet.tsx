'use client'

import { useState } from 'react'
import BottomSheet from '@/features/common/BottomSheet'
import { longDate, occurrence } from '@/lib/recurring'
import type { EndType } from '@/types'
import type { RecurringSettings } from './RecurringSection'

type Ends = Pick<RecurringSettings, 'end_type' | 'end_date' | 'max_occurrences'>

type Props = {
  open: boolean
  onClose: () => void
  settings: RecurringSettings
  startDate: string
  onSave: (ends: Ends) => void
}

const OPTIONS: { value: EndType; label: string }[] = [
  { value: 'never', label: 'Never' },
  { value: 'on_date', label: 'On a date' },
  { value: 'after_count', label: 'After a number of payments' },
]

// Picks when a recurring payment stops. Remounted on each open so it starts
// from the saved settings.
export default function EndsSheet(props: Props) {
  if (!props.open) return null
  return <EndsSheetBody {...props} />
}

function EndsSheetBody({ onClose, settings, startDate, onSave }: Props) {
  const [endType, setEndType] = useState<EndType>(settings.end_type)
  // Defaults: a year of payments.
  const [endDate, setEndDate] = useState(settings.end_date ?? occurrence(startDate, 'yearly', 1))
  const [count, setCount] = useState(String(settings.max_occurrences ?? 12))
  const [error, setError] = useState('')

  function save() {
    if (endType === 'on_date') {
      if (!endDate || endDate < startDate) {
        setError('Pick a date on or after the start date')
        return
      }
      onSave({ end_type: 'on_date', end_date: endDate, max_occurrences: null })
    } else if (endType === 'after_count') {
      const n = Number(count)
      if (!Number.isInteger(n) || n < 1) {
        setError('Enter a whole number of payments, 1 or more')
        return
      }
      onSave({ end_type: 'after_count', end_date: null, max_occurrences: n })
    } else {
      onSave({ end_type: 'never', end_date: null, max_occurrences: null })
    }
  }

  return (
    <BottomSheet open onClose={onClose} labelledBy="ends-sheet-title">
      <div id="ends-sheet-title" className="text-[18px] font-extrabold text-center pt-5" style={{ color: '#20242E' }}>Ends</div>

      <div role="radiogroup" aria-labelledby="ends-sheet-title" className="mt-4 rounded-[20px] px-4 py-1" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
        {OPTIONS.map((o, i) => {
          const selected = endType === o.value
          return (
            <div key={o.value} style={{ borderBottom: i < OPTIONS.length - 1 ? '1px solid #F4F0E9' : 'none' }}>
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => { setEndType(o.value); setError('') }}
                className="w-full flex items-center gap-3 py-3.5 text-left"
              >
                <span
                  className="flex items-center justify-center rounded-full flex-shrink-0"
                  style={{ width: 20, height: 20, border: selected ? '6px solid #3B6FF6' : '1.5px solid #D5D0C7', background: '#fff' }}
                />
                <span className="text-[14px] font-bold" style={{ color: '#2A2E37' }}>{o.label}</span>
              </button>

              {selected && o.value === 'on_date' && (
                <label className="relative flex items-center justify-between mb-3.5 rounded-[12px] px-3 py-2.5" style={{ background: '#F6F3EE' }}>
                  <span className="text-[13px] font-bold" style={{ color: '#2A2E37' }}>{endDate ? longDate(endDate) : 'Pick a date'}</span>
                  <span className="text-[12px] font-bold" style={{ color: '#3B6FF6' }}>Change</span>
                  <input
                    type="date"
                    aria-label="End date"
                    min={startDate}
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </label>
              )}

              {selected && o.value === 'after_count' && (
                <div className="flex items-center gap-2.5 mb-3.5 rounded-[12px] px-3 py-2" style={{ background: '#F6F3EE' }}>
                  <input
                    type="number"
                    inputMode="numeric"
                    aria-label="Number of payments"
                    min={1}
                    step={1}
                    value={count}
                    onChange={e => setCount(e.target.value)}
                    className="w-16 text-[14px] font-extrabold bg-transparent outline-none"
                    style={{ color: '#20242E' }}
                  />
                  <span className="text-[13px] font-semibold" style={{ color: '#6B707A' }}>payments in total</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {error && <p className="text-xs font-semibold rounded-xl px-3 py-2 mt-3" style={{ color: '#E0563E', background: '#FBE7E1' }}>{error}</p>}

      <button
        type="button"
        onClick={save}
        className="w-full mt-5 rounded-[17px] py-4 text-base font-extrabold text-white"
        style={{ background: '#3B6FF6', boxShadow: '0 14px 24px -10px rgba(59,111,246,.7)' }}
      >
        Done
      </button>
    </BottomSheet>
  )
}
