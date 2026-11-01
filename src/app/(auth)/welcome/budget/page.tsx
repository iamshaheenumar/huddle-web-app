import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getActiveGroup } from '@/lib/group'
import BudgetStepForm from './BudgetStepForm'

// Second set-up step: one number for the month. Coming back to it (a sign-in
// mid set-up) starts from the budget already saved.
export default async function BudgetStepPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const group = await getActiveGroup(supabase, user.id)

  const now = new Date()
  const { data: budget } = await supabase
    .from('budgets')
    .select('total_amount')
    .eq('group_id', group.id)
    .eq('year', now.getFullYear())
    .eq('month', now.getMonth() + 1)
    .maybeSingle()

  return <BudgetStepForm group={group} saved={Number((budget as { total_amount: number } | null)?.total_amount ?? 0)} />
}
