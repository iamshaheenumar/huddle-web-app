'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CURRENCY, MONTHS } from '@/lib/constants'
import { fmt } from '@/lib/format'
import StepHeader from '@/features/onboarding/StepHeader'
import type { GroupSummary } from '@/lib/group'

const SUGGESTIONS = [3000, 5000, 8000, 12000]

export default function BudgetStepForm({ group, saved }: { group: GroupSummary; saved: number }) {
  const router = useRouter()
  const [budget, setBudget] = useState(saved ? String(saved) : '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const total = parseInt(budget.replace(/\D/g, ''), 10) || 0
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  // Same daily figure Home shows before anything is spent: the budget spread
  // over the days left, today included.
  const daysLeft = new Date(year, month, 0).getDate() - now.getDate() + 1
  const perDay = Math.floor(total / daysLeft)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!total) return
    setLoading(true)
    setError('')
    // A first budget is just a total; categories can be split out from Home.
    const { error: budgetError } = await createClient().rpc('save_budget', {
      p_group_id: group.id,
      p_month: month,
      p_year: year,
      p_total: total,
      p_allocations: [],
    })
    if (budgetError) {
      setError(budgetError.message)
      setLoading(false)
      return
    }
    router.push('/welcome/invite')
  }

  return (
    <div className="min-h-screen flex justify-center" style={{ background: 'var(--background)' }}>
      <form onSubmit={handleSubmit} className="w-full max-w-[430px] flex flex-col px-5 pt-12 pb-[calc(env(safe-area-inset-bottom)+32px)]">
        <StepHeader step={3} backHref="/welcome/group" />

        <h1 className="mt-7 text-title font-extrabold tracking-tight" style={{ color: 'var(--ink)' }}>
          What can {group.name} spend in {MONTHS[month - 1]}?
        </h1>
        <p className="mt-1.5 text-body font-medium leading-normal" style={{ color: 'var(--ink-2)' }}>
          Everything the group spends together: groceries, bills, eating out.
        </p>

        <div className="mt-6">
          <label htmlFor="budget-total" className="text-meta font-bold mb-1.5 block" style={{ color: 'var(--ink-2)' }}>Monthly budget</label>
          <div className="flex items-center gap-2 rounded-2xl px-4 min-h-[60px] focus-within:outline-2 focus-within:outline-offset-2" style={{ background: 'var(--card)', border: '1px solid var(--line)', outlineColor: 'var(--focus-ring)' }}>
            <span className="text-row font-bold" style={{ color: 'var(--muted)' }}>{CURRENCY}</span>
            <input
              id="budget-total"
              type="text"
              inputMode="numeric"
              autoFocus
              aria-describedby="budget-per-day"
              value={total ? total.toLocaleString('en-US') : ''}
              onChange={e => setBudget(e.target.value)}
              placeholder="0"
              className="flex-1 min-w-0 bg-transparent outline-none text-title font-extrabold tabular-nums"
              style={{ color: 'var(--ink)' }}
            />
          </div>
          <div role="radiogroup" aria-label="Suggested amounts" className="mt-2.5 flex flex-wrap gap-2">
            {SUGGESTIONS.map(amount => {
              const selected = total === amount
              return (
                <button
                  key={amount}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setBudget(String(amount))}
                  className="min-h-10 px-3.5 rounded-full text-body tabular-nums transition-colors"
                  style={selected
                    ? { background: 'var(--inverse)', color: 'var(--on-inverse)', fontWeight: 700 }
                    : { background: 'var(--card)', color: 'var(--ink)', border: '1px solid var(--line)', fontWeight: 600 }}
                >
                  {fmt(amount)}
                </button>
              )
            })}
          </div>
        </div>

        <p
          id="budget-per-day"
          aria-live="polite"
          className="mt-5 rounded-2xl p-3.5 text-body font-medium leading-snug"
          style={{ background: 'var(--primary-soft)', color: 'var(--primary-text)' }}
        >
          {total
            ? <>That&apos;s about <b className="font-extrabold">{CURRENCY} {fmt(perDay)} a day</b> for the {daysLeft === 1 ? 'last day' : `${daysLeft} days left`} in {MONTHS[month - 1]}. Home keeps this number up to date as you spend.</>
            : <>Huddle turns this into what you can spend each day, and keeps it up to date as you spend.</>}
        </p>
        <p className="mt-2.5 text-meta font-medium" style={{ color: 'var(--muted)' }}>Split it into categories any time from Home.</p>

        {error && <p role="alert" className="mt-4 text-meta font-semibold rounded-xl px-3 py-2" style={{ color: 'var(--danger-text)', background: 'var(--danger-soft)' }}>{error}</p>}

        <div className="flex-1 min-h-8" />

        <button
          type="submit"
          disabled={!total || loading}
          className="w-full min-h-14 rounded-[17px] text-row font-extrabold disabled:cursor-not-allowed"
          style={total
            ? { background: 'var(--primary)', color: '#fff', opacity: loading ? 0.6 : 1 }
            : { background: 'var(--disabled)', color: 'var(--disabled-ink)' }}
        >
          {loading ? 'Saving…' : total ? 'Set budget' : 'Enter an amount to continue'}
        </button>
        <button type="button" onClick={() => router.push('/welcome/invite')} disabled={loading} className="mt-2 flex items-center justify-center min-h-12 text-body font-bold disabled:opacity-60" style={{ color: 'var(--primary-text)' }}>
          Skip for now
        </button>
      </form>
    </div>
  )
}
