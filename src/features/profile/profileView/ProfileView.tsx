'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SignOut } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import { useInvalidateAppData } from '@/lib/query/invalidate'
import { clearPersistedCache, clearOfflinePages } from '@/lib/query/client'
import { revalidateAppData } from '@/lib/actions'
import { MEMBER_COLORS } from '@/lib/constants'
import type { Profile } from '@/types'
import HuddleMark from '@/features/common/HuddleMark'

// Spoken names for the avatar swatches, in MEMBER_COLORS order.
const COLOR_NAMES = ['Blue', 'Green', 'Orange', 'Purple', 'Teal', 'Amber']

export default function ProfileView({ profile: initialProfile }: { profile: Profile | null }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const invalidateAppData = useInvalidateAppData()
  const [profile, setProfile] = useState<Profile | null>(initialProfile)
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    // Shared devices must not keep this user's financial data around.
    queryClient.clear()
    await Promise.all([clearPersistedCache(), clearOfflinePages(), revalidateAppData()])
    router.push('/login')
  }

  async function changeColor(color: string) {
    if (!profile) return
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ avatar_color: color } as never).eq('id', profile.id)
    // Needs a connection; keep showing the saved color if the update didn't go through.
    if (error) return
    setProfile(p => p ? { ...p, avatar_color: color } : p)
    await invalidateAppData()
  }

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: 'var(--background)' }}>
      <div className="px-5 pt-12 pb-0">
        <div className="flex items-center gap-4 mb-8">
          <HuddleMark size={56} shadow />
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--ink)' }}>Huddle</h1>
            <p className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>Budget together</p>
          </div>
        </div>

        {profile && (
          <div className="rounded-3xl p-5 mb-4" style={{ background: '#fff', border: '1px solid var(--hairline)' }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center font-extrabold text-xl text-white"
                style={{ background: profile.avatar_color }}>
                {profile.display_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-lg font-extrabold" style={{ color: 'var(--ink)' }}>{profile.display_name}</div>
                <div className="text-sm font-semibold mt-0.5" style={{ color: 'var(--muted)' }}>Member</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs font-bold mb-2" style={{ color: 'var(--ink-2)' }}>Avatar colour</div>
              <div className="flex gap-3 flex-wrap">
                {MEMBER_COLORS.map((c, i) => (
                  <button
                    key={c}
                    aria-label={`${COLOR_NAMES[i] ?? c} avatar colour`}
                    aria-pressed={profile.avatar_color === c}
                    onClick={() => changeColor(c)}
                    className="tap-target w-8 h-8 rounded-full transition-all"
                    style={{
                      background: c,
                      // A ring via box-shadow leaves outline free for the keyboard focus ring.
                      boxShadow: profile.avatar_color === c ? `0 0 0 2px #fff, 0 0 0 5px ${c}` : undefined,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleSignOut}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 rounded-2xl py-4 text-base font-extrabold transition-opacity disabled:opacity-60"
          style={{ background: '#fff', border: '1px solid var(--hairline)', color: 'var(--danger)' }}
        >
          <SignOut size={18} weight="bold" />
          {loading ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </div>
  )
}
