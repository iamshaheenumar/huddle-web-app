import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Check } from '@phosphor-icons/react/dist/ssr'
import { createClient } from '@/lib/supabase/server'
import StepHeader from '@/features/onboarding/StepHeader'
import HowItWorks from '@/features/onboarding/HowItWorks'
import ClearPendingEmail from './ClearPendingEmail'

// Where a confirmation link lands once /auth/confirm has signed the person in:
// the account is done, so this says how Huddle works before set-up starts.
export default async function EmailConfirmedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const firstName = String(user.user_metadata?.display_name ?? '').trim().split(/\s+/)[0]

  return (
    <div className="min-h-screen flex justify-center" style={{ background: 'var(--background)' }}>
      <ClearPendingEmail />
      <div className="w-full max-w-[430px] flex flex-col px-5 pt-12 pb-[calc(env(safe-area-inset-bottom)+32px)]">
        <StepHeader step={1} />

        <div className="mt-8 w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'var(--income-soft)', color: 'var(--income-text)' }}>
          <Check size={28} weight="bold" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-title font-extrabold tracking-tight" style={{ color: 'var(--ink)' }}>
          {firstName ? `You're in, ${firstName}` : "You're in"}
        </h1>
        <p className="mt-1.5 text-body font-medium leading-normal" style={{ color: 'var(--ink-2)' }}>
          Your email is confirmed. Here&apos;s how Huddle works.
        </p>

        <div className="mt-7">
          <HowItWorks />
        </div>

        <div className="flex-1 min-h-10" />

        <Link href="/welcome/group" className="flex items-center justify-center min-h-14 rounded-[17px] text-row font-extrabold text-white" style={{ background: 'var(--primary)' }}>
          Let&apos;s set it up
        </Link>
      </div>
    </div>
  )
}
