import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getActiveGroup } from '@/lib/group'
import { CURRENCY, MONTHS } from '@/lib/constants'
import { fmt } from '@/lib/format'
import HuddleMark from '@/features/common/HuddleMark'
import HowItWorks from '@/features/onboarding/HowItWorks'

// Where an invite lands once someone has joined. The group already has its
// name and budget, so instead of set-up this says what they've joined and how
// Huddle works.
export default async function JoinedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const group = await getActiveGroup(supabase, user.id)

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const [{ data: budget }, { count }] = await Promise.all([
    // The budget in effect this month, carried forward like Home does.
    supabase
      .from('budgets')
      .select('total_amount')
      .eq('group_id', group.id)
      .or(`year.lt.${year},and(year.eq.${year},month.lte.${month})`)
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from('group_members').select('user_id', { count: 'exact', head: true }).eq('group_id', group.id),
  ])
  const total = Number((budget as { total_amount: number } | null)?.total_amount ?? 0)
  const others = Math.max(0, (count ?? 1) - 1)

  return (
    <div className="min-h-screen flex justify-center" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-[430px] flex flex-col px-5 pt-16 pb-[calc(env(safe-area-inset-bottom)+32px)]">
        <HuddleMark size={56} shadow />
        <h1 className="mt-6 text-title font-extrabold tracking-tight" style={{ color: 'var(--ink)' }}>You&apos;ve joined {group.name}</h1>
        <p className="mt-1.5 text-body font-medium leading-normal" style={{ color: 'var(--ink-2)' }}>
          {others > 0 ? `You and ${others} other${others === 1 ? '' : 's'} share one budget now.` : 'You share one budget with this group now.'}
        </p>

        {total > 0 && (
          <div className="mt-6 rounded-2xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--hairline)' }}>
            <div className="text-meta font-bold" style={{ color: 'var(--muted)' }}>{MONTHS[month - 1]} budget</div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-row font-bold" style={{ color: 'var(--muted)' }}>{CURRENCY}</span>
              <span className="text-figure font-extrabold tabular-nums leading-none" style={{ color: 'var(--ink)' }}>{fmt(total)}</span>
            </div>
          </div>
        )}

        <div className="mt-7">
          <HowItWorks joined />
        </div>

        <div className="flex-1 min-h-10" />

        <Link href="/dashboard" className="flex items-center justify-center min-h-14 rounded-[17px] text-row font-extrabold text-white" style={{ background: 'var(--primary)' }}>
          Go to Home
        </Link>
      </div>
    </div>
  )
}
