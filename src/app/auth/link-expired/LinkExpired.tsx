'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Timer } from '@phosphor-icons/react'
import { resendConfirmation, savePendingEmail, usePendingEmail } from '@/features/onboarding/confirmation'

// Where a confirmation or invite link lands when it can't be used: it expired,
// was already opened (mail scanners do this), or was the older of two.
export default function LinkExpired({ invite }: { invite: boolean }) {
  const router = useRouter()
  // Starts as the address the last link went to; typing replaces it.
  const pending = usePendingEmail()
  const [typed, setEmail] = useState<string | null>(null)
  const email = typed ?? pending
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError('')
    const message = await resendConfirmation(email)
    if (message) {
      setError(message)
      setSending(false)
      return
    }
    savePendingEmail(email)
    router.push('/signup/check-email')
  }

  return (
    <div className="min-h-screen flex justify-center" style={{ background: 'var(--background)' }}>
      <form onSubmit={handleSend} className="w-full max-w-[430px] flex flex-col px-5 pt-[72px] pb-[calc(env(safe-area-inset-bottom)+32px)]">
        <div className="mt-10 flex flex-col items-center text-center">
          <div className="w-[88px] h-[88px] rounded-[28px] flex items-center justify-center" style={{ background: 'var(--warning-soft)', color: 'var(--warning)' }}>
            <Timer size={40} aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-title font-extrabold tracking-tight" style={{ color: 'var(--ink)' }}>
            {invite ? 'This invite has expired' : 'This link has expired'}
          </h1>
          <p className="mt-2.5 text-row font-medium leading-normal max-w-[310px]" style={{ color: 'var(--ink-2)' }}>
            {invite
              ? 'Invite links only work for a while. Ask whoever invited you to send a new one.'
              : "Confirmation links work once and only for a while. It may also have been opened already. We'll send you a fresh one."}
          </p>
        </div>

        {!invite && (
          <>
            <div className="mt-8">
              <label htmlFor="expired-email" className="text-meta font-bold mb-1.5 block" style={{ color: 'var(--ink-2)' }}>Email</label>
              <input
                id="expired-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl px-4 min-h-[52px] text-input font-semibold outline-none"
                style={{ background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--ink)' }}
              />
            </div>
            <p className="mt-4 rounded-2xl px-4 py-3.5 text-body font-medium leading-normal" style={{ background: 'var(--card)', border: '1px solid var(--hairline)', color: 'var(--ink-2)' }}>
              Already confirmed it? Then you&apos;re all set. Just{' '}
              <Link href="/login" className="font-bold" style={{ color: 'var(--primary-text)' }}>sign in</Link>.
            </p>
          </>
        )}

        {error && <p role="alert" className="mt-4 text-meta font-semibold rounded-xl px-3 py-2" style={{ color: 'var(--danger-text)', background: 'var(--danger-soft)' }}>{error}</p>}

        <div className="flex-1 min-h-8" />

        {!invite && (
          <button
            type="submit"
            disabled={sending}
            className="w-full min-h-14 rounded-[17px] text-row font-extrabold text-white transition-opacity disabled:opacity-60"
            style={{ background: 'var(--primary)' }}
          >
            {sending ? 'Sending…' : 'Send a new link'}
          </button>
        )}
        <Link href="/login" className="mt-2 flex items-center justify-center min-h-12 text-row font-bold" style={{ color: 'var(--primary-text)' }}>
          Back to sign in
        </Link>
      </form>
    </div>
  )
}
