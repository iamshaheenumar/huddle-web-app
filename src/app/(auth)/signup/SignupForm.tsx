'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { revalidateAppData } from '@/lib/actions'
import { clearPersistedCache } from '@/lib/query/client'
import HuddleMark from '@/features/common/HuddleMark'

export default function SignupForm({ next }: { next?: string }) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [groupName, setGroupName] = useState('Home')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName, group_name: groupName } },
    })
    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Start from an empty cache so a previous user's data never shows.
    await Promise.all([revalidateAppData(), clearPersistedCache()])
    router.push(next ?? '/dashboard')
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
          <h2 className="text-title font-extrabold mb-6" style={{ color: 'var(--ink)' }}>Create your account</h2>
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <div>
              <label className="text-meta font-bold mb-1.5 block" style={{ color: 'var(--ink-2)' }}>Your name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Aisha"
                className="w-full rounded-2xl px-4 py-3.5 text-input font-semibold outline-none"
                style={{ background: 'var(--background)', border: '1px solid var(--line)', color: 'var(--ink)' }}
              />
            </div>
            <div>
              <label className="text-meta font-bold mb-1.5 block" style={{ color: 'var(--ink-2)' }}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl px-4 py-3.5 text-input font-semibold outline-none"
                style={{ background: 'var(--background)', border: '1px solid var(--line)', color: 'var(--ink)' }}
              />
            </div>
            <div>
              <label className="text-meta font-bold mb-1.5 block" style={{ color: 'var(--ink-2)' }}>Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl px-4 py-3.5 text-input font-semibold outline-none"
                style={{ background: 'var(--background)', border: '1px solid var(--line)', color: 'var(--ink)' }}
              />
            </div>
            <div>
              <label className="text-meta font-bold mb-1.5 block" style={{ color: 'var(--ink-2)' }}>First group name</label>
              <input
                type="text"
                required
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                placeholder="Home"
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
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-body font-medium mt-6" style={{ color: 'var(--muted)' }}>
          Already have an account?{' '}
          <Link href={next ? `/login?next=${encodeURIComponent(next)}` : '/login'} className="font-bold" style={{ color: 'var(--primary-text)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
