'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { regenerateInvite } from '@/lib/group'
import { inviteByEmail } from '@/features/members/actions'

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const inlineBtn = 'rounded-xl px-4 py-2.5 text-body font-bold flex-shrink-0 transition-colors'

export default function InviteCard({ code, groupId }: { code: string; groupId: string }) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sentTo, setSentTo] = useState('')
  const [error, setError] = useState('')

  const link = typeof window !== 'undefined' ? `${window.location.origin}/join/${code}` : `/join/${code}`
  const codeDisplay = `${code.slice(0, 4)} ${code.slice(4)}`
  const valid = EMAIL_RX.test(email.trim())

  async function handleCopy() {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  async function handleRegenerate() {
    setRegenerating(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      await regenerateInvite(supabase, groupId, user.id)
      setCopied(false)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not generate a new code')
    } finally {
      setRegenerating(false)
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!valid || sending) return
    setSending(true)
    setError('')
    const target = email.trim()
    const result = await inviteByEmail(target)
    setSending(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setEmail('')
    setSentTo(target)
    setTimeout(() => setSentTo(''), 3000)
    router.refresh()
  }

  return (
    <div className="mx-5 mt-5 rounded-[22px] px-5 pt-5.5 pb-5" style={{ background: 'var(--card)', border: '1px solid var(--hairline)' }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-meta font-bold uppercase tracking-[0.04em]" style={{ color: 'var(--muted)' }}>Invite code</div>
          <div className="text-figure font-extrabold tracking-[0.06em] mt-1.5 tabular-nums leading-none" style={{ color: 'var(--ink)' }}>{codeDisplay}</div>
        </div>
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="flex items-center gap-1.5 rounded-full px-3 py-2 text-meta font-bold flex-shrink-0 disabled:opacity-60"
          style={{ background: 'var(--background)', color: 'var(--ink)' }}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className={regenerating ? 'animate-spin' : undefined}>
            <path d="M13.5 8A5.5 5.5 0 1 1 11.8 4M13.5 2v3h-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {regenerating ? 'Generating…' : 'New code'}
        </button>
      </div>
      <div className="text-meta font-medium mt-2.5" style={{ color: 'var(--muted)' }}>Expires in 7 days</div>

      <div className="flex items-center gap-2 mt-4.5 rounded-2xl py-1.5 pr-1.5 pl-4" style={{ background: 'var(--background)' }}>
        <div className="flex-1 min-w-0 text-body font-semibold truncate" style={{ color: 'var(--ink)' }}>
          {link.replace(/^https?:\/\//, '')}
        </div>
        <button
          onClick={handleCopy}
          className={inlineBtn}
          style={copied
            ? { minWidth: 84, background: 'var(--income-soft)', color: 'var(--income-text)' }
            : { minWidth: 84, background: 'var(--primary)', color: '#fff', boxShadow: '0 8px 16px -8px rgba(59,111,246,.7)' }}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="flex items-center gap-3 mt-5.5 mb-4.5">
        <div className="flex-1 h-px" style={{ background: 'var(--hairline)' }} />
        <div className="text-meta font-medium" style={{ color: 'var(--muted)' }}>or send it by email</div>
        <div className="flex-1 h-px" style={{ background: 'var(--hairline)' }} />
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 rounded-2xl py-1.5 pr-1.5 pl-4" style={{ background: 'var(--card)', border: '1px solid var(--hairline)' }}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="friend@example.com"
          className="flex-1 min-w-0 bg-transparent outline-none py-2 text-input font-medium"
          style={{ color: 'var(--ink)' }}
        />
        <button
          type="submit"
          disabled={!valid || sending}
          className={inlineBtn}
          style={valid
            ? { minWidth: 84, background: 'var(--inverse)', color: 'var(--on-inverse)', opacity: sending ? 0.7 : 1 }
            : { minWidth: 84, background: 'var(--hairline)', color: 'var(--muted)', cursor: 'default' }}
        >
          {sending ? 'Sending…' : 'Send'}
        </button>
      </form>

      {sentTo && <div className="text-meta font-semibold mt-2.5" style={{ color: 'var(--income-text)' }}>Invite sent to {sentTo}</div>}
      {error && <p className="text-meta font-semibold rounded-xl px-3 py-2 mt-2.5" style={{ color: 'var(--danger-text)', background: 'var(--danger-soft)' }}>{error}</p>}
    </div>
  )
}
