'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Plus } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'
import { useInvalidateAppData } from '@/lib/query/invalidate'
import { switchActiveGroup, type GroupSummary } from '@/lib/group'

export default function GroupSwitcher({ currentGroup, groups }: { currentGroup: GroupSummary; groups: GroupSummary[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const invalidateAppData = useInvalidateAppData()

  async function handleSwitch(groupId: string) {
    if (groupId === currentGroup.id || loading) {
      setOpen(false)
      return
    }
    setLoading(true)
    const supabase = createClient()
    try {
      await switchActiveGroup(supabase, groupId)
      setOpen(false)
      await invalidateAppData()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} aria-expanded={open} aria-haspopup="menu" className="flex items-center gap-2 mt-0.5 min-h-11">
        <span className="text-title font-extrabold tracking-tight" style={{ color: 'var(--ink)' }}>{currentGroup.name}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform .15s' }}>
          <path d="M2 4l4 4 4-4" stroke="#666B75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-2 z-20 w-56 rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid var(--hairline)', boxShadow: '0 16px 32px -12px rgba(32,36,46,.18)' }}>
            {groups.map(g => (
              <button
                key={g.id}
                onClick={() => handleSwitch(g.id)}
                disabled={loading}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left text-body font-bold disabled:opacity-60"
                style={{ color: 'var(--ink)', borderBottom: '1px solid var(--hairline)' }}
              >
                {g.name}
                {g.id === currentGroup.id && <Check size={15} weight="bold" color="#2F63E0" />}
              </button>
            ))}
            <Link
              href="/groups/new"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-body font-bold"
              style={{ color: 'var(--primary)' }}
            >
              <Plus size={15} weight="bold" /> Create new group
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
