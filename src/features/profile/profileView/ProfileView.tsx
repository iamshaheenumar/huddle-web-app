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
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#F6F3EE' }}>
      <div className="px-5 pt-12 pb-0">
        <div className="flex items-center gap-4 mb-8">
          <HuddleMark size={56} shadow />
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#20242E' }}>Huddle</h1>
            <p className="text-sm font-semibold" style={{ color: '#9A9FA8' }}>Budget together</p>
          </div>
        </div>

        {profile && (
          <div className="rounded-3xl p-5 mb-4" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center font-extrabold text-xl text-white"
                style={{ background: profile.avatar_color }}>
                {profile.display_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-lg font-extrabold" style={{ color: '#20242E' }}>{profile.display_name}</div>
                <div className="text-sm font-semibold mt-0.5" style={{ color: '#9A9FA8' }}>Member</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs font-bold mb-2" style={{ color: '#6B707A' }}>Avatar colour</div>
              <div className="flex gap-2 flex-wrap">
                {MEMBER_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => changeColor(c)}
                    className="w-8 h-8 rounded-full transition-all"
                    style={{
                      background: c,
                      outline: profile.avatar_color === c ? `3px solid ${c}` : 'none',
                      outlineOffset: 2,
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
          style={{ background: '#fff', border: '1px solid #F0ECE4', color: '#E0563E' }}
        >
          <SignOut size={18} weight="bold" />
          {loading ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </div>
  )
}
