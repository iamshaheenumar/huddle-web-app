'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { CaretRight, Check, X } from '@phosphor-icons/react'
import { useGettingStarted } from './queries'
import FirstEntrySheet from './FirstEntrySheet'

// Home's checklist for a new account: what's left to try, each a link to where
// it's done. Replaces the "No budget set" card while it shows.
export default function GettingStarted() {
  const gs = useGettingStarted()
  const finished = gs?.finished
  const hide = gs?.hide

  // Everything's done: turn it off so it doesn't come back if, say, the only
  // recurring payment is deleted later.
  useEffect(() => { if (finished) hide?.() }, [finished, hide])

  if (!gs) return null

  return (
    <>
      <FirstEntrySheet ready={gs.hasFirstEntry} />
      {gs.visible && (
        <section aria-labelledby="getting-started" className="mx-5 mt-5 rounded-[22px] pt-4 pb-1.5 px-4" style={{ background: 'var(--card)', border: '1px solid var(--hairline)' }}>
          <div className="flex items-center gap-3">
            <h2 id="getting-started" className="flex-1 text-section font-extrabold" style={{ color: 'var(--ink)' }}>Get started</h2>
            <span className="text-meta font-bold tabular-nums" style={{ color: 'var(--muted)' }}>
              {gs.items.filter(i => i.done).length} of {gs.items.length}
            </span>
            <button
              type="button"
              onClick={gs.hide}
              aria-label="Hide Get started"
              className="-mr-2 w-11 h-11 rounded-full flex items-center justify-center"
              style={{ color: 'var(--icon-subtle)' }}
            >
              <X size={16} weight="bold" />
            </button>
          </div>
          <ul className="mt-1">
            {gs.items.map((item, i) => {
              const border = i < gs.items.length - 1 ? '1px solid var(--hairline)' : 'none'
              const mark = item.done ? (
                <span className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center" style={{ background: 'var(--income)', color: '#fff' }}>
                  <Check size={13} weight="bold" aria-hidden="true" />
                </span>
              ) : (
                <span className="w-6 h-6 shrink-0 rounded-full" style={{ border: '2px solid var(--control-off)' }} aria-hidden="true" />
              )
              return (
                <li key={item.key} style={{ borderBottom: border }}>
                  {item.done || !item.href ? (
                    <div className="flex items-center gap-3 min-h-12">
                      {mark}
                      <span className="flex-1 text-row font-semibold line-through" style={{ color: 'var(--muted)' }}>
                        {item.label}<span className="sr-only"> (done)</span>
                      </span>
                    </div>
                  ) : (
                    <Link href={item.href} className="flex items-center gap-3 min-h-12">
                      {mark}
                      <span className="flex-1 text-row font-bold" style={{ color: 'var(--ink)' }}>{item.label}</span>
                      <CaretRight size={14} weight="bold" style={{ color: 'var(--icon-subtle)' }} aria-hidden="true" />
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </>
  )
}
