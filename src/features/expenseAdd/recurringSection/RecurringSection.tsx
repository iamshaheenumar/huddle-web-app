'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowsClockwise, CalendarCheck, CaretDown } from '@phosphor-icons/react'
import Toggle from '@/features/common/Toggle'
import Segmented from '@/features/common/Segmented'
import { FREQUENCIES, FREQUENCY_LABEL, endsLabel, scheduleLabel, shortDate } from '@/lib/recurring'
import type { EndType, Frequency } from '@/types'
import EndsSheet from './EndsSheet'

export type RecurringSettings = {
  frequency: Frequency
  end_type: EndType
  end_date: string | null
  max_occurrences: number | null
}

type Props = {
  enabled: boolean
  // Omitted when editing an existing recurring payment: it can't be turned off there.
  onEnabledChange?: (enabled: boolean) => void
  settings: RecurringSettings
  onChange: (settings: RecurringSettings) => void
  startDate: string
  // The payment after the one being saved now; null when there won't be one.
  nextDue: string | null
  showManageLink?: boolean
}

const FREQUENCY_OPTIONS = FREQUENCIES.map(f => ({ value: f, label: FREQUENCY_LABEL[f] }))

// The "Recurring payment" card on the add-expense form: frequency, when it
// ends, and a preview of the next due date.
export default function RecurringSection({ enabled, onEnabledChange, settings, onChange, startDate, nextDue, showManageLink }: Props) {
  const [endsOpen, setEndsOpen] = useState(false)

  return (
    <div className="px-5 pt-2.5">
      <div className="flex flex-col gap-3.5 rounded-[18px] px-[15px] py-3.5" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
        <div className="flex items-center gap-[11px]">
          <div className="flex items-center justify-center flex-shrink-0 rounded-[11px]" style={{ width: 34, height: 34, background: '#E9F0FE', color: '#3B6FF6' }}>
            <ArrowsClockwise size={17} weight="bold" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-extrabold" style={{ color: '#20242E' }}>Recurring payment</div>
            <div className="text-[11px] font-semibold" style={{ color: '#9A9FA8' }}>Added automatically on each due date</div>
          </div>
          {onEnabledChange && <Toggle checked={enabled} onChange={onEnabledChange} label="Recurring payment" />}
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
              style={{ border: '1px solid #F0ECE4' }}
            >
              <div className="text-[10px] font-bold uppercase tracking-[.4px]" style={{ color: '#9A9FA8' }}>Ends</div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-[13px] font-bold" style={{ color: '#2A2E37' }}>{endsLabel(settings)}</span>
                <CaretDown size={11} weight="bold" color="#B6BAC1" />
              </div>
            </button>

            <div className="flex items-center gap-[7px] text-[12px] font-semibold" style={{ color: '#6B707A' }}>
              <CalendarCheck size={15} weight="fill" color="#3B6FF6" className="flex-shrink-0" />
              <span className="flex-1 min-w-0">
                {scheduleLabel(settings.frequency, startDate)}
                {nextDue
                  ? <> · next on <b className="font-extrabold" style={{ color: '#20242E' }}>{shortDate(nextDue)}</b></>
                  : ' · no further payments'}
              </span>
              {showManageLink && (
                <Link href="/recurring" className="text-[12px] font-bold whitespace-nowrap" style={{ color: '#3B6FF6' }}>
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
        onSave={ends => {
          onChange({ ...settings, ...ends })
          setEndsOpen(false)
        }}
      />
    </div>
  )
}
