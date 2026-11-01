'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import StepHeader from '@/features/onboarding/StepHeader'
import type { GroupSummary } from '@/lib/group'

const SUGGESTIONS = ['Home', 'Family', 'Flatmates', 'Office']

export default function NameGroupForm({ group }: { group: GroupSummary }) {
  const router = useRouter()
  const [name, setName] = useState(group.name)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const trimmed = name.trim()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!trimmed) return
    setLoading(true)
    setError('')

    if (trimmed !== group.name) {
      const { error: renameError } = await createClient().from('groups').update({ name: trimmed } as never).eq('id', group.id)
      if (renameError) {
        setError(renameError.message)
        setLoading(false)
        return
      }
    }

    router.push('/welcome/budget')
  }

  return (
    <div className="min-h-screen flex justify-center" style={{ background: 'var(--background)' }}>
      <form onSubmit={handleSubmit} className="w-full max-w-[430px] flex flex-col px-5 pt-12 pb-[calc(env(safe-area-inset-bottom)+32px)]">
        <StepHeader step={2} />

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
          {loading ? 'Saving…' : trimmed ? 'Continue' : 'Name your group to continue'}
        </button>
      </form>
    </div>
  )
}
