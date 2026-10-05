'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { revalidateAppData } from '@/lib/actions'
import MemberAvatar from '@/features/common/MemberAvatar'
import { signupAndJoin, completeInviteSignup } from './actions'
import HuddleMark from '@/features/common/HuddleMark'

type Member = { display_name: string; avatar_color: string }

type Props = {
  code: string
  groupName: string
  inviterName: string
  memberCount: number
  members: Member[]
  isAuthenticated: boolean
  // Arrived via an email invite: signed in, but no password or name yet.
  needsSetup?: boolean
  email?: string
}

export default function InviteAcceptCard({ code, groupName, inviterName, memberCount, members, isAuthenticated, needsSetup = false, email: invitedEmail }: Props) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState(invitedEmail ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: joinError } = await supabase.rpc('join_group_by_code', { invite_code: code })
    if (joinError) {
      setError(joinError.message)
      setLoading(false)
      return
    }
    await revalidateAppData()
    router.push('/dashboard')
  }

  async function handleSignupAndJoin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = needsSetup
      ? await completeInviteSignup(displayName, password, code)
      : await signupAndJoin(email, password, displayName, code)
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    await revalidateAppData()
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12" style={{ background: '#F6F3EE' }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8 text-center">
          <HuddleMark size={64} shadow className="mb-4" />
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#20242E' }}>Join {groupName}</h1>
          <p className="text-sm font-semibold mt-1" style={{ color: '#9A9FA8' }}>Invited by {inviterName}</p>
        </div>

        <div className="rounded-3xl p-5 mb-6" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
          <div className="text-xs font-bold mb-3" style={{ color: '#9A9FA8' }}>
            {memberCount} member{memberCount !== 1 ? 's' : ''} already here
          </div>
          <div className="flex flex-wrap gap-2">
            {members.map((m, i) => (
              <div key={i} className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1" style={{ background: '#F6F3EE' }}>
                <MemberAvatar name={m.display_name} color={m.avatar_color} size={26} fontSize={11} />
                <span className="text-[12px] font-bold" style={{ color: '#3A3F49' }}>{m.display_name}</span>
              </div>
            ))}
          </div>
        </div>

        {isAuthenticated && !needsSetup ? (
          <div className="rounded-3xl p-6" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
            {error && <p className="text-xs font-semibold rounded-xl px-3 py-2 mb-4" style={{ color: '#E0563E', background: '#FBE7E1' }}>{error}</p>}
            <button
              onClick={handleJoin}
              disabled={loading}
              className="w-full rounded-2xl py-4 text-base font-extrabold text-white transition-opacity disabled:opacity-60"
              style={{ background: '#3B6FF6', boxShadow: '0 14px 24px -10px rgba(59,111,246,.7)' }}
            >
              {loading ? 'Joining…' : `Join ${groupName}`}
            </button>
          </div>
        ) : (
          <div className="rounded-3xl p-6" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
            <h2 className="text-xl font-extrabold mb-6" style={{ color: '#20242E' }}>{needsSetup ? 'Finish setting up' : 'Create your account'}</h2>
            <form onSubmit={handleSignupAndJoin} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold mb-1.5 block" style={{ color: '#6B707A' }}>Your name</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Aisha"
                  className="w-full rounded-2xl px-4 py-3.5 text-sm font-semibold outline-none"
                  style={{ background: '#F6F3EE', border: '1px solid #EAE5DD', color: '#20242E' }}
                />
              </div>
              <div>
                <label className="text-xs font-bold mb-1.5 block" style={{ color: '#6B707A' }}>Email</label>
                <input
                  type="email"
                  required
                  readOnly={needsSetup}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl px-4 py-3.5 text-sm font-semibold outline-none"
                  style={{ background: '#F6F3EE', border: '1px solid #EAE5DD', color: '#20242E' }}
                />
              </div>
              <div>
                <label className="text-xs font-bold mb-1.5 block" style={{ color: '#6B707A' }}>Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
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
                {loading ? 'Joining…' : needsSetup ? `Join ${groupName}` : 'Create account & join'}
              </button>
            </form>
          </div>
        )}

        {!needsSetup && <p className="text-center text-sm font-semibold mt-6" style={{ color: '#9A9FA8' }}>
          {isAuthenticated ? (
            <Link href="/dashboard" className="font-bold" style={{ color: '#3B6FF6' }}>Maybe later</Link>
          ) : (
            <>
              Already have an account?{' '}
              <Link href={`/login?next=/join/${code}`} className="font-bold" style={{ color: '#3B6FF6' }}>Sign in</Link>
            </>
          )}
        </p>}
      </div>
    </div>
  )
}
