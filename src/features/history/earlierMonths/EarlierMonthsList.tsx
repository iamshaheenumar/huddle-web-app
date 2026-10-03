'use client'

import { useState } from 'react'
import Link from 'next/link'
import { fmt } from '@/lib/format'
import type { EarlierMonth } from '../types'

const PAGE_SIZE = 6

const periodKey = (m: EarlierMonth) => `${m.period.year}-${String(m.period.month).padStart(2, '0')}`

export default function EarlierMonthsList({ months }: { months: EarlierMonth[] }) {
  const [visible, setVisible] = useState(PAGE_SIZE)
  const remaining = months.length - visible

  return (
    <div className="flex flex-col gap-2.5 px-5 mt-3">
      {months.slice(0, visible).map(m => (
        <Link
          key={periodKey(m)}
          href={`/history?period=${periodKey(m)}`}
          scroll={false}
          className="flex items-center gap-3.5 rounded-[20px] p-3.5"
          style={{ background: '#fff', border: '1px solid #F0ECE4' }}
        >
          <div className="flex flex-col items-center justify-center rounded-2xl flex-shrink-0" style={{ width: 46, height: 46, background: m.accent.bg }}>
            <span className="text-[10px] font-extrabold leading-none" style={{ color: m.accent.color }}>{m.monthAbbr}</span>
            <span className="text-[15px] font-extrabold leading-none mt-1" style={{ color: '#20242E' }}>{m.yearShort}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-bold" style={{ color: '#20242E' }}>{m.label}</div>
            <div className="text-[12px] font-medium mt-0.5 truncate" style={{ color: '#9A9FA8' }}>
              {m.hasBudget
                ? `Spent ${fmt(m.totalSpent)} of ${fmt(m.totalBudget)} · ${m.overspent ? 'over budget' : 'under budget'}`
                : `Spent ${fmt(m.totalSpent)} · no budget`}
            </div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C6C2B9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
        </Link>
      ))}
      {remaining > 0 && (
        <button
          onClick={() => setVisible(v => v + PAGE_SIZE)}
          className="rounded-[20px] py-3 text-[13px] font-bold"
          style={{ background: '#fff', border: '1px solid #EAE5DD', color: '#3B6FF6' }}
        >
          Show {Math.min(PAGE_SIZE, remaining)} more · {remaining} left
        </button>
      )}
    </div>
  )
}
