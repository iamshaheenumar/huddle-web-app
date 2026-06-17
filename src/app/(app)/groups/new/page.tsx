'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CaretLeft } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'
import { createNewGroup } from '@/lib/group'

export default function NewGroupPage() {
  const router = useRouter()
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
      router.push('/dashboard')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create group')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#F6F3EE' }}>
      {/* Header */}
      <div className="flex items-center gap-3.5 px-5 pt-12 pb-0">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-[13px] flex items-center justify-center" style={{ background: '#fff', border: '1px solid #EAE5DD', color: '#3A3F49' }}>
          <CaretLeft size={17} weight="bold" />
        </button>
        <span className="text-[17px] font-extrabold" style={{ color: '#20242E' }}>Create new group</span>
      </div>

      {/* Form card */}
      <div className="mx-5 mt-5 rounded-3xl p-6" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#E9F0FE' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#3B6FF6"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
        </div>
        <div className="text-[13px] font-bold mb-2" style={{ color: '#6B707A' }}>Group name</div>
        <input
          type="text"
          autoFocus
          placeholder="e.g. Office, Roommates"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full rounded-2xl px-4 py-3.5 text-[15px] font-semibold outline-none"
          style={{ background: '#F6F3EE', color: '#20242E' }}
        />
        {error && <p className="text-xs font-semibold rounded-xl px-3 py-2 mt-3" style={{ color: '#E0563E', background: '#FBE7E1' }}>{error}</p>}
      </div>

      {/* Create button */}
      <div className="px-5 mt-6">
        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full rounded-[17px] py-4 text-base font-extrabold text-white transition-opacity disabled:opacity-70"
          style={{ background: '#3B6FF6', boxShadow: '0 14px 24px -10px rgba(59,111,246,.7)' }}
        >
          {loading ? 'Creating…' : 'Create group'}
        </button>
      </div>
    </div>
  )
}
