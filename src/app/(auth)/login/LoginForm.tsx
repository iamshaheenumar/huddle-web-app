'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UsersThree } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm({ next }: { next?: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(next ?? '/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12" style={{ background: '#F6F3EE' }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#3B6FF6', boxShadow: '0 10px 22px -8px rgba(59,111,246,.6)' }}>
            <UsersThree size={32} weight="fill" color="#fff" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#20242E' }}>Huddle</h1>
          <p className="text-sm font-semibold mt-1" style={{ color: '#9A9FA8' }}>Budget together</p>
        </div>

        <div className="rounded-3xl p-6" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
          <h2 className="text-xl font-extrabold mb-6" style={{ color: '#20242E' }}>Welcome back</h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold mb-1.5 block" style={{ color: '#6B707A' }}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl px-4 py-3.5 text-sm font-semibold outline-none transition-all"
                style={{ background: '#F6F3EE', border: '1px solid #EAE5DD', color: '#20242E' }}
              />
            </div>
            <div>
              <label className="text-xs font-bold mb-1.5 block" style={{ color: '#6B707A' }}>Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl px-4 py-3.5 text-sm font-semibold outline-none"
                style={{ background: '#F6F3EE', border: '1px solid #EAE5DD', color: '#20242E' }}
              />
            </div>
            {error && <p className="text-xs font-semibold rounded-xl px-3 py-2" style={{ color: '#E0563E', background: '#FBE7E1' }}>{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl py-4 text-base font-extrabold text-white mt-2 transition-opacity disabled:opacity-60"
              style={{ background: '#3B6FF6', boxShadow: '0 14px 24px -10px rgba(59,111,246,.7)' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm font-semibold mt-6" style={{ color: '#9A9FA8' }}>
          Don&apos;t have an account?{' '}
          <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : '/signup'} className="font-bold" style={{ color: '#3B6FF6' }}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}
