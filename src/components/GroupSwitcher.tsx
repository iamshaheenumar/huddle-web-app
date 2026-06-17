'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, Plus } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'
import { switchActiveGroup, type GroupSummary } from '@/lib/group'

export default function GroupSwitcher({ currentGroup, groups }: { currentGroup: GroupSummary; groups: GroupSummary[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

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
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-2 mt-0.5">
        <span className="text-[22px] font-extrabold tracking-tight" style={{ color: '#20242E' }}>{currentGroup.name}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform .15s' }}>
          <path d="M2 4l4 4 4-4" stroke="#9A9FA8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-2 z-20 w-56 rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #F0ECE4', boxShadow: '0 16px 32px -12px rgba(32,36,46,.18)' }}>
            {groups.map(g => (
              <button
                key={g.id}
                onClick={() => handleSwitch(g.id)}
                disabled={loading}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left text-[14px] font-bold disabled:opacity-60"
                style={{ color: '#2A2E37', borderBottom: '1px solid #F4F0E9' }}
              >
                {g.name}
                {g.id === currentGroup.id && <Check size={15} weight="bold" color="#3B6FF6" />}
              </button>
            ))}
            <Link
              href="/groups/new"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-[14px] font-bold"
              style={{ color: '#3B6FF6' }}
            >
              <Plus size={15} weight="bold" /> Create new group
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
