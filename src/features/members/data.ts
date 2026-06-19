import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getActiveGroup } from '@/lib/group'
import type { MemberStat } from './types'

// Fallback color sequence used when a member has no avatar_color (5 colors,
// intentionally distinct from lib/constants MEMBER_COLORS).
const MEMBER_COLORS_PALETTE = ['#3B6FF6', '#2E9E6B', '#E5683E', '#8A5CF0', '#1FA0A6']

type MemberRow = { user_id: string; role: string; profiles: { display_name: string; avatar_color: string } | null }
type ExpenseRow = { paid_by: string; amount: number }

// One auth + active-group + period resolution per request, shared by every helper below.
export const getMembersContext = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const group = await getActiveGroup(supabase, user.id)
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`
  return { supabase, user, group, month, year, monthStart }
})

const getRawMembers = cache(async (): Promise<MemberRow[]> => {
  const { supabase, group } = await getMembersContext()
  const { data } = await supabase
    .from('group_members')
    .select('user_id, role, profiles(display_name, avatar_color)')
    .eq('group_id', group.id)
  return (data as unknown as MemberRow[]) ?? []
})

export const getMonthExpenses = cache(async (): Promise<ExpenseRow[]> => {
  const { supabase, group, monthStart } = await getMembersContext()
  const { data } = await supabase
    .from('expenses')
    .select('paid_by, amount')
    .eq('group_id', group.id)
    .gte('expense_date', monthStart)
  return (data as unknown as ExpenseRow[]) ?? []
})

export const getTotalBudget = cache(async (): Promise<number> => {
  const { supabase, group, month, year } = await getMembersContext()
  const { data } = await supabase
    .from('budgets')
    .select('total_amount')
    .eq('group_id', group.id)
    .eq('month', month)
    .eq('year', year)
    .single()
  return (data as unknown as { total_amount: number } | null)?.total_amount ?? 0
})

// Members sorted by spend (desc) with a resolved display color attached, so the
// total-card bar and the member list share an identical index→color mapping.
export const getMembers = cache(async (): Promise<MemberStat[]> => {
  const [rawMembers, expenses] = await Promise.all([getRawMembers(), getMonthExpenses()])
  return rawMembers
    .map(m => {
      const memberExpenses = expenses.filter(e => e.paid_by === m.user_id)
      return {
        user_id: m.user_id,
        role: m.role,
        profile: m.profiles,
        spent: memberExpenses.reduce((s, e) => s + e.amount, 0),
        txCount: memberExpenses.length,
      }
    })
    .sort((a, b) => b.spent - a.spent)
    .map((m, i) => ({ ...m, color: m.profile?.avatar_color ?? MEMBER_COLORS_PALETTE[i % MEMBER_COLORS_PALETTE.length] }))
})

export const getIsOwner = cache(async (): Promise<boolean> => {
  const [{ user }, rawMembers] = await Promise.all([getMembersContext(), getRawMembers()])
  return rawMembers.some(m => m.user_id === user.id && m.role === 'owner')
})

export const getMembersSummary = cache(async () => {
  const { month } = await getMembersContext()
  const [expenses, totalBudget, members] = await Promise.all([getMonthExpenses(), getTotalBudget(), getMembers()])
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0)
  const pctUsed = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0
  return { month, totalSpent, totalBudget, pctUsed, memberCount: members.length }
})
