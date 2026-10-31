'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { EnvelopeSimple } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'
import { revalidateAppData } from '@/lib/actions'
import { clearPersistedCache } from '@/lib/query/client'
import StepHeader from '@/features/onboarding/StepHeader'
import { confirmRedirectTo, savePendingEmail, usePendingEmail } from '@/features/onboarding/confirmation'

const field = 'w-full rounded-2xl px-4 min-h-[52px] text-input font-semibold outline-none'
const fieldStyle = { background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--ink)' }

export default function SignupForm({ next }: { next?: string }) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  // Back from "Change email": starts from the address they used last time.
  const pending = usePendingEmail()
  const [typed, setEmail] = useState<string | null>(null)
  const email = typed ?? pending
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // The group itself comes from the signup trigger ("Home"); it's named on
    // the set-up screen once the email is confirmed.
    const { data, error: authError } = await createClient().auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        // Without this the verification link falls back to the project's Site URL.
        emailRedirectTo: confirmRedirectTo(next),
      },
    })
    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Email confirmation is on, so there's no session until the link is tapped.
    if (!data.session) {
      savePendingEmail(email)
      router.push(next ? `/signup/check-email?next=${encodeURIComponent(next)}` : '/signup/check-email')
      return
    }

    // Confirmation off: signed in already. Start from an empty cache so a
    // previous user's data never shows.
    await Promise.all([revalidateAppData(), clearPersistedCache()])
    router.push(next ?? '/welcome/group')
  }

  return (
    <div className="min-h-screen flex justify-center" style={{ background: 'var(--background)' }}>
      <form onSubmit={handleSignup} className="w-full max-w-[430px] flex flex-col px-5 pt-12 pb-[calc(env(safe-area-inset-bottom)+32px)]">
        <StepHeader step={1} backHref="/" />

        <h1 className="mt-7 text-title font-extrabold tracking-tight" style={{ color: 'var(--ink)' }}>Create your account</h1>
        <p className="mt-1.5 text-body font-medium" style={{ color: 'var(--ink-2)' }}>It takes a minute. You&apos;ll set up your group next.</p>

        <div className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="signup-name" className="text-meta font-bold mb-1.5 block" style={{ color: 'var(--ink-2)' }}>Your name</label>
            <input id="signup-name" type="text" required autoComplete="name" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Aisha" className={field} style={fieldStyle} />
          </div>
          <div>
            <label htmlFor="signup-email" className="text-meta font-bold mb-1.5 block" style={{ color: 'var(--ink-2)' }}>Email</label>
            <input id="signup-email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={field} style={fieldStyle} />
          </div>
          <div>
            <label htmlFor="signup-password" className="text-meta font-bold mb-1.5 block" style={{ color: 'var(--ink-2)' }}>Password</label>
            <div className="flex items-center rounded-2xl pl-4 pr-1.5 min-h-[52px] focus-within:outline-2 focus-within:outline-offset-2" style={{ ...fieldStyle, outlineColor: 'var(--focus-ring)' }}>
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                autoComplete="new-password"
                aria-describedby="signup-password-hint"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="flex-1 min-w-0 bg-transparent outline-none text-input font-semibold"
                style={{ color: 'var(--ink)' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                aria-pressed={showPassword}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="min-h-10 px-2.5 rounded-[10px] text-body font-bold"
                style={{ color: 'var(--primary-text)' }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <p id="signup-password-hint" className="mt-1.5 text-meta font-medium" style={{ color: 'var(--muted)' }}>At least 6 characters.</p>
          </div>
        </div>

        <div className="mt-5 flex gap-3 items-start rounded-2xl p-3.5" style={{ background: 'var(--primary-soft)' }}>
          <EnvelopeSimple size={20} weight="bold" className="shrink-0 mt-px" style={{ color: 'var(--primary-text)' }} aria-hidden="true" />
          <p className="text-body font-semibold leading-snug" style={{ color: 'var(--primary-text)' }}>
            We&apos;ll email you a link to confirm it&apos;s you. You&apos;ll need to tap it before you can sign in.
          </p>
        </div>

        {error && <p role="alert" className="mt-4 text-meta font-semibold rounded-xl px-3 py-2" style={{ color: 'var(--danger-text)', background: 'var(--danger-soft)' }}>{error}</p>}

        <div className="flex-1 min-h-8" />

        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-14 rounded-[17px] text-row font-extrabold text-white transition-opacity disabled:opacity-60"
          style={{ background: 'var(--primary)' }}
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
        <p className="text-center text-body font-medium mt-3.5" style={{ color: 'var(--muted)' }}>
          Already have an account?{' '}
          <Link href={next ? `/login?next=${encodeURIComponent(next)}` : '/login'} className="font-bold" style={{ color: 'var(--primary-text)' }}>Sign in</Link>
        </p>
      </form>
    </div>
  )
}
