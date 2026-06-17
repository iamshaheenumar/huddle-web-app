'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { regenerateInvite } from '@/lib/group'

export default function InviteCodeCard({ code, groupId }: { code: string; groupId: string }) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const link = typeof window !== 'undefined' ? `${window.location.origin}/join/${code}` : `/join/${code}`

  async function handleCopy() {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleRegenerate() {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      await regenerateInvite(supabase, groupId, user.id)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not generate a new code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-5 mt-5 rounded-3xl p-6 text-center" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
      <div className="text-[12px] font-bold" style={{ color: '#9A9FA8' }}>Invite code</div>
      <div className="text-[32px] font-extrabold tracking-[0.1em] mt-1" style={{ color: '#20242E' }}>{code}</div>

      <div className="mt-4 rounded-2xl px-4 py-3 text-[13px] font-semibold truncate" style={{ background: '#F6F3EE', color: '#6B707A' }}>
        {link}
      </div>

      <button
        onClick={handleCopy}
        className="w-full rounded-2xl py-3.5 text-sm font-extrabold text-white mt-4 transition-opacity"
        style={{ background: '#3B6FF6', boxShadow: '0 14px 24px -10px rgba(59,111,246,.7)' }}
      >
        {copied ? 'Copied!' : 'Copy link'}
      </button>

      <button
        onClick={handleRegenerate}
        disabled={loading}
        className="w-full rounded-2xl py-3 text-sm font-bold mt-2.5 transition-opacity disabled:opacity-60"
        style={{ background: 'transparent', color: '#9A9FA8' }}
      >
        {loading ? 'Generating…' : 'Generate new code'}
      </button>

      {error && <p className="text-xs font-semibold rounded-xl px-3 py-2 mt-2" style={{ color: '#E0563E', background: '#FBE7E1' }}>{error}</p>}
    </div>
  )
}
