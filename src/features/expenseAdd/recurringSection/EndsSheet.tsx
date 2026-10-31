'use client'

import { useState } from 'react'
import BottomSheet from '@/features/common/BottomSheet'
import { longDate, occurrence, occurrenceNoun } from '@/lib/recurring'
import type { EndType } from '@/types'
import type { RecurringSettings } from './RecurringSection'

type Ends = Pick<RecurringSettings, 'end_type' | 'end_date' | 'max_occurrences'>

type Props = {
  open: boolean
  onClose: () => void
  settings: RecurringSettings
  startDate: string
  // Recurring income: counts deposits rather than payments.
  income?: boolean
  onSave: (ends: Ends) => void
}

const options = (noun: string): { value: EndType; label: string }[] => [
  { value: 'never', label: 'Never' },
  { value: 'on_date', label: 'On a date' },
  { value: 'after_count', label: `After a number of ${noun}s` },
]

// Picks when a recurring payment or income stops. Remounted on each open so it starts
// from the saved settings.
export default function EndsSheet(props: Props) {
  if (!props.open) return null
  return <EndsSheetBody {...props} />
}

function EndsSheetBody({ onClose, settings, startDate, income, onSave }: Props) {
  const noun = occurrenceNoun(income)
  const endOptions = options(noun)
  const [endType, setEndType] = useState<EndType>(settings.end_type)
  // Defaults: a year of them.
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
        setError(`Enter a whole number of ${noun}s, 1 or more`)
        return
      }
      onSave({ end_type: 'after_count', end_date: null, max_occurrences: n })
    } else {
      onSave({ end_type: 'never', end_date: null, max_occurrences: null })
    }
  }

  return (
    <BottomSheet open onClose={onClose} labelledBy="ends-sheet-title">
      <div id="ends-sheet-title" className="text-section font-extrabold text-center pt-5" style={{ color: 'var(--ink)' }}>Ends</div>

      <div role="radiogroup" aria-labelledby="ends-sheet-title" className="mt-4 rounded-[20px] px-4 py-1" style={{ background: 'var(--card)', border: '1px solid var(--hairline)' }}>
        {endOptions.map((o, i) => {
          const selected = endType === o.value
          return (
            <div key={o.value} style={{ borderBottom: i < endOptions.length - 1 ? '1px solid var(--hairline)' : 'none' }}>
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => { setEndType(o.value); setError('') }}
                className="w-full flex items-center gap-3 py-3.5 text-left"
              >
                <span
                  className="flex items-center justify-center rounded-full flex-shrink-0"
                  style={{ width: 20, height: 20, border: selected ? '6px solid var(--primary)' : '1.5px solid var(--control-off)', background: 'var(--card)' }}
                />
                <span className="text-body font-bold" style={{ color: 'var(--ink)' }}>{o.label}</span>
              </button>

              {selected && o.value === 'on_date' && (
                <label className="relative flex items-center justify-between mb-3.5 rounded-[12px] px-3 py-2.5" style={{ background: 'var(--background)' }}>
                  <span className="text-body font-bold" style={{ color: 'var(--ink)' }}>{endDate ? longDate(endDate) : 'Pick a date'}</span>
                  <span className="text-meta font-bold" style={{ color: 'var(--primary-text)' }}>Change</span>
                  <input
                    type="date"
                    aria-label="End date"
                    min={startDate}
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer text-input"
                  />
                </label>
              )}

              {selected && o.value === 'after_count' && (
                <div className="flex items-center gap-2.5 mb-3.5 rounded-[12px] px-3 py-2" style={{ background: 'var(--background)' }}>
                  <input
                    type="number"
                    inputMode="numeric"
                    aria-label={`Number of ${noun}s`}
                    min={1}
                    step={1}
                    value={count}
                    onChange={e => setCount(e.target.value)}
                    className="w-16 text-input font-extrabold bg-transparent outline-none"
                    style={{ color: 'var(--ink)' }}
                  />
                  <span className="text-meta font-medium" style={{ color: 'var(--ink-2)' }}>{noun}s in total</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {error && <p className="text-meta font-semibold rounded-xl px-3 py-2 mt-3" style={{ color: 'var(--danger-text)', background: 'var(--danger-soft)' }}>{error}</p>}

      <button
        type="button"
        onClick={save}
        className="w-full mt-5 rounded-[17px] py-4 text-row font-extrabold text-white"
        style={{ background: 'var(--primary)', boxShadow: '0 14px 24px -10px rgba(59,111,246,.7)' }}
      >
        Done
      </button>
    </BottomSheet>
  )
}
