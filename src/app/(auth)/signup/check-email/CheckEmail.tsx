'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, EnvelopeSimple } from '@phosphor-icons/react'
import StepHeader from '@/features/onboarding/StepHeader'
import { inboxFor, resendConfirmation, usePendingEmail } from '@/features/onboarding/confirmation'

// Supabase rate-limits confirmation emails; a minute between resends stays clear of it.
const COOLDOWN = 60

// Shown straight after signup while confirmation is pending: says where the
// link went, offers the inbox, a resend and a way to fix a typo.
export default function CheckEmail({ next }: { next?: string }) {
  const email = usePendingEmail()
  const [seconds, setSeconds] = useState(0)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (seconds <= 0) return
    const t = setTimeout(() => setSeconds(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  async function handleResend() {
    if (!email || seconds > 0 || sending) return
    setSending(true)
    setError('')
    const message = await resendConfirmation(email, next)
    setSending(false)
    if (message) {
      setError(message)
      return
    }
    setSent(true)
    setSeconds(COOLDOWN)
  }

  const inbox = email ? inboxFor(email) : null

  return (
    <div className="min-h-screen flex justify-center" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-[430px] flex flex-col px-5 pt-12 pb-[calc(env(safe-area-inset-bottom)+32px)]">
        <StepHeader step={1} />

        <div className="mt-12 flex flex-col items-center text-center">
          <div className="w-[88px] h-[88px] rounded-[28px] flex items-center justify-center" style={{ background: 'var(--primary-soft)', color: 'var(--primary-text)' }}>
            <EnvelopeSimple size={40} aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-title font-extrabold tracking-tight" style={{ color: 'var(--ink)' }}>Check your inbox</h1>
          <p className="mt-2.5 text-row font-medium" style={{ color: 'var(--ink-2)' }}>We sent a confirmation link to</p>
          <p className="mt-0.5 text-row font-extrabold break-all" style={{ color: 'var(--ink)' }}>{email || 'your email address'}</p>
          <p className="mt-2.5 text-body font-medium leading-normal max-w-[300px]" style={{ color: 'var(--ink-2)' }}>
            Tap the link on this phone and you&apos;ll come straight back here, signed in.
          </p>
        </div>

        {sent && !error && (
          <div role="status" className="mt-6 flex gap-2.5 items-center rounded-[14px] px-3.5 py-3 text-body font-bold" style={{ background: 'var(--income-soft)', color: 'var(--income-text)' }}>
            <Check size={18} weight="bold" aria-hidden="true" />
            Sent again. The newest link is the one that works.
          </div>
        )}
        {error && <p role="alert" className="mt-6 text-meta font-semibold rounded-xl px-3 py-2" style={{ color: 'var(--danger-text)', background: 'var(--danger-soft)' }}>{error}</p>}

        <div className="mt-6 rounded-2xl px-4 py-3.5" style={{ background: 'var(--card)', border: '1px solid var(--hairline)' }}>
          <p className="text-body font-bold" style={{ color: 'var(--ink)' }}>Can&apos;t find it?</p>
          <ul className="mt-1.5 pl-[18px] list-disc text-body font-medium leading-relaxed" style={{ color: 'var(--ink-2)' }}>
            <li>Look in Spam or Promotions.</li>
            <li>It comes from Huddle and can take a minute.</li>
            <li>Opened it on a computer? <Link href="/login" className="font-bold" style={{ color: 'var(--primary-text)' }}>Sign in here</Link> once it&apos;s confirmed.</li>
          </ul>
        </div>

        <div className="flex-1 min-h-8" />

        {inbox && (
          <a href={inbox.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center min-h-14 rounded-[17px] text-row font-extrabold text-white" style={{ background: 'var(--primary)' }}>
            {inbox.label}
          </a>
        )}
        <div className={`grid grid-cols-2 gap-2 ${inbox ? 'mt-2' : ''}`}>
          <button
            type="button"
            onClick={handleResend}
            disabled={!email || seconds > 0 || sending}
            className="min-h-12 rounded-[15px] text-body font-bold disabled:cursor-not-allowed"
            style={seconds > 0 || !email
              ? { background: 'var(--subtle)', border: '1px solid var(--line)', color: 'var(--disabled-ink)' }
              : { background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--ink)' }}
          >
            {sending ? 'Sending…' : seconds > 0 ? `Resend in ${seconds}s` : 'Resend email'}
          </button>
          <Link
            href={next ? `/signup?next=${encodeURIComponent(next)}` : '/signup'}
            className="flex items-center justify-center min-h-12 rounded-[15px] text-body font-bold"
            style={{ background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--ink)' }}
          >
            Change email
          </Link>
        </div>
      </div>
    </div>
  )
}
