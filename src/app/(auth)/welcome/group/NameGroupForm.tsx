'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserPlus } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'
import { revalidateAppData } from '@/lib/actions'
import { clearPersistedCache } from '@/lib/query/client'
import { CURRENCY } from '@/lib/constants'
import StepHeader from '@/features/onboarding/StepHeader'
import type { GroupSummary } from '@/lib/group'

const SUGGESTIONS = ['Home', 'Family', 'Flatmates', 'Office']

export default function NameGroupForm({ group }: { group: GroupSummary }) {
  const router = useRouter()
  const [name, setName] = useState(group.name)
  const [budget, setBudget] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const trimmed = name.trim()
  const total = parseInt(budget.replace(/\D/g, ''), 10) || 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!trimmed) return
    setLoading(true)
    setError('')
    const supabase = createClient()

    if (trimmed !== group.name) {
      const { error: renameError } = await supabase.from('groups').update({ name: trimmed } as never).eq('id', group.id)
      if (renameError) {
        setError(renameError.message)
        setLoading(false)
        return
      }
    }

    // A first budget is just a total; categories can be split out from Home.
    if (total > 0) {
      const now = new Date()
      const { error: budgetError } = await supabase.rpc('save_budget', {
        p_group_id: group.id,
        p_month: now.getMonth() + 1,
        p_year: now.getFullYear(),
        p_total: total,
        p_allocations: [],
      })
      if (budgetError) {
        setError(budgetError.message)
        setLoading(false)
        return
      }
    }

    // Start from an empty cache so a previous user's data never shows.
    await Promise.all([revalidateAppData(), clearPersistedCache()])
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex justify-center" style={{ background: 'var(--background)' }}>
      <form onSubmit={handleSubmit} className="w-full max-w-[430px] flex flex-col px-5 pt-12 pb-[calc(env(safe-area-inset-bottom)+32px)]">
        <StepHeader step={3} />

        <h1 className="mt-7 text-title font-extrabold tracking-tight" style={{ color: 'var(--ink)' }}>Name your group</h1>
        <p className="mt-1.5 text-body font-medium leading-normal" style={{ color: 'var(--ink-2)' }}>
          A group is the people who share one budget. You can create more later.
        </p>

        <div className="mt-6">
          <label htmlFor="group-name" className="text-meta font-bold mb-1.5 block" style={{ color: 'var(--ink-2)' }}>Group name</label>
          <input
            id="group-name"
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Home"
            className="w-full rounded-2xl px-4 min-h-[52px] text-input font-semibold outline-none"
            style={{ background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--ink)' }}
          />
          <div role="radiogroup" aria-label="Suggestions" className="mt-2.5 flex flex-wrap gap-2">
            {SUGGESTIONS.map(s => {
              const selected = trimmed === s
              return (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setName(s)}
                  className="min-h-10 px-3.5 rounded-full text-body transition-colors"
                  style={selected
                    ? { background: 'var(--inverse)', color: 'var(--on-inverse)', fontWeight: 700 }
                    : { background: 'var(--card)', color: 'var(--ink)', border: '1px solid var(--line)', fontWeight: 600 }}
                >
                  {s}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-6">
          <label htmlFor="group-budget" className="text-meta font-bold mb-1.5 block" style={{ color: 'var(--ink-2)' }}>
            Monthly budget <span className="font-medium" style={{ color: 'var(--muted)' }}>(optional)</span>
          </label>
          <div className="flex items-center gap-2 rounded-2xl px-4 min-h-[52px] focus-within:outline-2 focus-within:outline-offset-2" style={{ background: 'var(--card)', border: '1px solid var(--line)', outlineColor: 'var(--focus-ring)' }}>
            <span className="text-row font-bold" style={{ color: 'var(--muted)' }}>{CURRENCY}</span>
            <input
              id="group-budget"
              type="text"
              inputMode="numeric"
              aria-describedby="group-budget-hint"
              value={total ? total.toLocaleString('en-US') : ''}
              onChange={e => setBudget(e.target.value)}
              placeholder="0"
              className="flex-1 min-w-0 bg-transparent outline-none text-input font-bold tabular-nums"
              style={{ color: 'var(--ink)' }}
            />
          </div>
          <p id="group-budget-hint" className="mt-1.5 text-meta font-medium" style={{ color: 'var(--muted)' }}>Split it into categories any time from Home.</p>
        </div>

        <div className="mt-6 flex gap-3 items-center rounded-2xl p-3.5" style={{ background: 'var(--card)', border: '1px solid var(--hairline)' }}>
          <span className="w-9 h-9 shrink-0 rounded-[11px] flex items-center justify-center" style={{ background: 'var(--primary-soft)', color: 'var(--primary-text)' }}>
            <UserPlus size={18} weight="bold" aria-hidden="true" />
          </span>
          <p className="text-body font-medium leading-snug" style={{ color: 'var(--ink-2)' }}>You&apos;ll get an invite link for the others from the Group tab.</p>
        </div>

        {error && <p role="alert" className="mt-4 text-meta font-semibold rounded-xl px-3 py-2" style={{ color: 'var(--danger-text)', background: 'var(--danger-soft)' }}>{error}</p>}

        <div className="flex-1 min-h-8" />

        <button
          type="submit"
          disabled={!trimmed || loading}
          className="w-full min-h-14 rounded-[17px] text-row font-extrabold disabled:cursor-not-allowed"
          style={trimmed
            ? { background: 'var(--primary)', color: '#fff', opacity: loading ? 0.6 : 1 }
            : { background: 'var(--disabled)', color: 'var(--disabled-ink)' }}
        >
          {loading ? 'Setting up…' : trimmed ? `Create ${trimmed}` : 'Name your group to continue'}
        </button>
        <Link href="/dashboard" className="mt-2 flex items-center justify-center min-h-12 text-body font-bold" style={{ color: 'var(--primary-text)' }}>
          Skip for now
        </Link>
      </form>
    </div>
  )
}
