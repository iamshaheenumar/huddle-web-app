'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowsClockwise, CalendarCheck, CaretDown } from '@phosphor-icons/react'
import Toggle from '@/features/common/Toggle'
import Segmented from '@/features/common/Segmented'
import { FREQUENCIES, FREQUENCY_LABEL, endsLabel, occurrenceNoun, scheduleLabel, shortDate } from '@/lib/recurring'
import type { EndType, Frequency } from '@/types'
import EndsSheet from './EndsSheet'

export type RecurringSettings = {
  frequency: Frequency
  end_type: EndType
  end_date: string | null
  max_occurrences: number | null
}

type Props = {
  // Recurring income (e.g. a salary) rather than a payment.
  income?: boolean
  enabled: boolean
  // Omitted when editing an existing recurring payment: it can't be turned off there.
  onEnabledChange?: (enabled: boolean) => void
  settings: RecurringSettings
  onChange: (settings: RecurringSettings) => void
  startDate: string
  // The occurrence after the one being saved now; null when there won't be one.
  nextDue: string | null
  showManageLink?: boolean
}

const FREQUENCY_OPTIONS = FREQUENCIES.map(f => ({ value: f, label: FREQUENCY_LABEL[f] }))

// The "Recurring payment" / "Recurring income" card on the add form: frequency,
// when it ends, and a preview of the next due date.
export default function RecurringSection({ income, enabled, onEnabledChange, settings, onChange, startDate, nextDue, showManageLink }: Props) {
  const [endsOpen, setEndsOpen] = useState(false)
  const title = income ? 'Recurring income' : 'Recurring payment'
  const noun = occurrenceNoun(income)

  return (
    <div className="px-5 pt-2.5">
      <div className="flex flex-col gap-3.5 rounded-[18px] px-[15px] py-3.5" style={{ background: 'var(--card)', border: '1px solid var(--hairline)' }}>
        <div className="flex items-center gap-[11px]">
          <div className="flex items-center justify-center flex-shrink-0 rounded-[11px]" style={{ width: 34, height: 34, background: 'var(--primary-soft)', color: 'var(--primary-text)' }}>
            <ArrowsClockwise size={17} weight="bold" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-body font-extrabold" style={{ color: 'var(--ink)' }}>{title}</div>
            <div className="text-label font-semibold" style={{ color: 'var(--muted)' }}>Added automatically on each due date</div>
          </div>
          {onEnabledChange && <Toggle checked={enabled} onChange={onEnabledChange} label={title} />}
        </div>

        {enabled && (
          <>
            <Segmented
              label="Repeats"
              options={FREQUENCY_OPTIONS}
              value={settings.frequency}
              onChange={frequency => onChange({ ...settings, frequency })}
            />

            <button
              type="button"
              onClick={() => setEndsOpen(true)}
              className="text-left rounded-[12px] px-[11px] py-2"
              style={{ border: '1px solid var(--hairline)' }}
            >
              <div className="text-label font-bold uppercase tracking-[.4px]" style={{ color: 'var(--muted)' }}>Ends</div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-body font-bold" style={{ color: 'var(--ink)' }}>{endsLabel(settings, noun)}</span>
                <CaretDown size={11} weight="bold" style={{ color: 'var(--muted)' }} />
              </div>
            </button>

            <div className="flex items-center gap-[7px] text-meta font-medium" style={{ color: 'var(--ink-2)' }}>
              <CalendarCheck size={15} weight="fill" style={{ color: 'var(--primary-text)' }} className="flex-shrink-0" />
              <span className="flex-1 min-w-0">
                {scheduleLabel(settings.frequency, startDate)}
                {nextDue
                  ? <> · next on <b className="font-extrabold" style={{ color: 'var(--ink)' }}>{shortDate(nextDue)}</b></>
                  : ` · no further ${noun}s`}
              </span>
              {showManageLink && (
                <Link href="/recurring" className="text-meta font-bold whitespace-nowrap" style={{ color: 'var(--primary-text)' }}>
                  Manage recurring
                </Link>
              )}
            </div>
          </>
        )}
      </div>

      <EndsSheet
        open={endsOpen}
        onClose={() => setEndsOpen(false)}
        settings={settings}
        startDate={startDate}
        income={income}
        onSave={ends => {
          onChange({ ...settings, ...ends })
          setEndsOpen(false)
        }}
      />
    </div>
  )
}
