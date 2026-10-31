import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Check } from '@phosphor-icons/react/dist/ssr'
import { createClient } from '@/lib/supabase/server'
import StepHeader from '@/features/onboarding/StepHeader'
import ClearPendingEmail from './ClearPendingEmail'

// Where a confirmation link lands once /auth/confirm has signed the person in.
export default async function EmailConfirmedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen flex justify-center" style={{ background: 'var(--background)' }}>
      <ClearPendingEmail />
      <div className="w-full max-w-[430px] flex flex-col px-5 pt-12 pb-[calc(env(safe-area-inset-bottom)+32px)]">
        <StepHeader step={2} />

        <div className="flex-1 flex flex-col items-center justify-center text-center pb-10">
          <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: 'var(--income-soft)', color: 'var(--income-text)' }}>
            <Check size={44} weight="bold" aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-title font-extrabold tracking-tight" style={{ color: 'var(--ink)' }}>Email confirmed</h1>
          <p className="mt-2.5 text-row font-medium leading-normal max-w-[300px]" style={{ color: 'var(--ink-2)' }}>
            You&apos;re signed in as <b className="break-all" style={{ color: 'var(--ink)' }}>{user.email}</b>. One more step and your budget is ready.
          </p>
        </div>

        <Link href="/welcome/group" className="flex items-center justify-center min-h-14 rounded-[17px] text-row font-extrabold text-white" style={{ background: 'var(--primary)' }}>
          Set up your group
        </Link>
      </div>
    </div>
  )
}
