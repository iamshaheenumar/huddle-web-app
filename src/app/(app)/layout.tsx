import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateProfile } from '@/lib/profile'
import BottomNav from '@/features/common/BottomNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await getOrCreateProfile(supabase, user)

  return (
    <div className="flex flex-col items-center min-h-screen" style={{ background: '#ECEAE4' }}>
      <div
        className="relative flex flex-col w-full"
        style={{ maxWidth: 430, minHeight: '100svh', background: '#F6F3EE', overflow: 'hidden' }}
      >
        <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 80, paddingTop: 'env(safe-area-inset-top)' }}>
          {children}
        </div>
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full" style={{ maxWidth: 430 }}>
          <BottomNav />
        </div>
      </div>
    </div>
  )
}
