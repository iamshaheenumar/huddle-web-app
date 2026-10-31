'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CaretLeft } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'
import { useInvalidateAppData } from '@/lib/query/invalidate'
import { createNewGroup } from '@/lib/group'

export default function GroupsNewForm() {
  const router = useRouter()
  const invalidateAppData = useInvalidateAppData()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate() {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Enter a group name')
      return
    }
    setLoading(true)
    setError('')
    const supabase = createClient()
    try {
      await createNewGroup(supabase, trimmed)
      await invalidateAppData()
      router.push('/dashboard')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create group')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <div className="flex items-center gap-3.5 px-5 pt-12 pb-0">
        <button onClick={() => router.back()} aria-label="Back" className="w-11 h-11 rounded-[14px] flex items-center justify-center" style={{ background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--ink)' }}>
          <CaretLeft size={17} weight="bold" />
        </button>
        <span className="text-section font-extrabold" style={{ color: 'var(--ink)' }}>Create new group</span>
      </div>

      {/* Form card */}
      <div className="mx-5 mt-5 rounded-3xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--hairline)' }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--primary-soft)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--primary-text)' }}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
        </div>
        <div className="text-body font-bold mb-2" style={{ color: 'var(--ink-2)' }}>Group name</div>
        <input
          type="text"
          autoFocus
          placeholder="e.g. Office, Roommates"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full rounded-2xl px-4 py-3.5 text-input font-semibold outline-none"
          style={{ background: 'var(--background)', color: 'var(--ink)' }}
        />
        {error && <p className="text-meta font-semibold rounded-xl px-3 py-2 mt-3" style={{ color: 'var(--danger-text)', background: 'var(--danger-soft)' }}>{error}</p>}
      </div>

      {/* Create button */}
      <div className="px-5 mt-auto pt-6 pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full rounded-[17px] py-4 text-row font-extrabold text-white transition-opacity disabled:opacity-70"
          style={{ background: 'var(--primary)', boxShadow: '0 14px 24px -10px rgba(59,111,246,.7)' }}
        >
          {loading ? 'Creating…' : 'Create group'}
        </button>
      </div>
    </div>
  )
}
