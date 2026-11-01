'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { revalidateAppData } from '@/lib/actions'
import { clearPersistedCache } from '@/lib/query/client'
import { Check, CheckCircle, EnvelopeSimple } from '@phosphor-icons/react'
import HuddleMark from '@/features/common/HuddleMark'
import { resendConfirmation, savePendingEmail } from '@/features/onboarding/confirmation'

// `confirmed`: arrived from a confirmation link opened in another browser, so
// the email is confirmed but this browser still has to sign in.
export default function LoginForm({ next, confirmed = false }: { next?: string; confirmed?: boolean }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [unconfirmed, setUnconfirmed] = useState(false)
  const [resend, setResend] = useState<'idle' | 'sending' | 'sent'>('idle')

  async function handleResend() {
    setResend('sending')
    const message = await resendConfirmation(email, next)
    if (message) {
      setError(message)
      setResend('idle')
      return
    }
    savePendingEmail(email)
    setResend('sent')
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setUnconfirmed(false)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error?.code === 'email_not_confirmed') {
      setUnconfirmed(true)
      setResend('idle')
      setLoading(false)
    } else if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Start from an empty cache so a previous user's data never shows.
      await Promise.all([revalidateAppData(), clearPersistedCache()])
      // A new account that hasn't finished set-up goes back through it; saved steps come prefilled.
      const onboarding = data.user?.user_metadata?.onboarding === true
      router.push(next ?? (onboarding ? '/welcome/group' : '/dashboard'))
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <HuddleMark size={64} shadow className="mb-4" />
          <h1 className="text-figure font-extrabold tracking-tight" style={{ color: 'var(--ink)' }}>Huddle</h1>
          <p className="text-body font-medium mt-1" style={{ color: 'var(--muted)' }}>Budget together</p>
        </div>

        <div className="rounded-3xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--hairline)' }}>
          <h2 className="text-title font-extrabold mb-6" style={{ color: 'var(--ink)' }}>Welcome back</h2>

          {confirmed && !unconfirmed && (
            <div role="status" className="mb-5 flex gap-2.5 items-start rounded-2xl p-3.5" style={{ background: 'var(--income-soft)' }}>
              <CheckCircle size={20} weight="fill" className="shrink-0 mt-px" style={{ color: 'var(--income-text)' }} aria-hidden="true" />
              <p className="text-body font-semibold leading-snug" style={{ color: 'var(--income-text)' }}>Email confirmed. Sign in to continue.</p>
            </div>
          )}

          {unconfirmed && (
            <div role="alert" className="mb-5 rounded-2xl p-3.5" style={{ background: 'var(--warning-soft)' }}>
              <div className="flex gap-2.5 items-start">
                <EnvelopeSimple size={20} weight="bold" className="shrink-0 mt-px" style={{ color: 'var(--warning)' }} aria-hidden="true" />
                <div>
                  <p className="text-body font-extrabold" style={{ color: 'var(--warning)' }}>Confirm your email first</p>
                  <p className="mt-0.5 text-meta font-medium leading-snug" style={{ color: 'var(--warning)' }}>
                    We sent a link to {email} when you signed up. Tap it, then sign in here.
                  </p>
                </div>
              </div>
              {resend === 'sent' ? (
                <p role="status" className="mt-3 ml-[30px] flex items-center gap-1.5 min-h-10 text-meta font-bold" style={{ color: 'var(--income-text)' }}>
                  <Check size={16} weight="bold" aria-hidden="true" />
                  Sent. Check your inbox.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resend === 'sending'}
                  className="mt-3 ml-[30px] min-h-10 px-3.5 rounded-xl text-meta font-bold disabled:opacity-60"
                  style={{ background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--ink)' }}
                >
                  {resend === 'sending' ? 'Sending…' : 'Send the link again'}
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label htmlFor="login-email" className="text-meta font-bold mb-1.5 block" style={{ color: 'var(--ink-2)' }}>Email</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl px-4 py-3.5 text-input font-semibold outline-none transition-all"
                style={{ background: 'var(--background)', border: '1px solid var(--line)', color: 'var(--ink)' }}
              />
            </div>
            <div>
              <label htmlFor="login-password" className="text-meta font-bold mb-1.5 block" style={{ color: 'var(--ink-2)' }}>Password</label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl px-4 py-3.5 text-input font-semibold outline-none"
                style={{ background: 'var(--background)', border: '1px solid var(--line)', color: 'var(--ink)' }}
              />
            </div>
            {error && <p className="text-meta font-semibold rounded-xl px-3 py-2" style={{ color: 'var(--danger-text)', background: 'var(--danger-soft)' }}>{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl py-4 text-row font-extrabold text-white mt-2 transition-opacity disabled:opacity-60"
              style={{ background: 'var(--primary)', boxShadow: '0 14px 24px -10px rgba(59,111,246,.7)' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-body font-medium mt-6" style={{ color: 'var(--muted)' }}>
          Don&apos;t have an account?{' '}
          <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : '/signup'} className="font-bold" style={{ color: 'var(--primary-text)' }}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}
