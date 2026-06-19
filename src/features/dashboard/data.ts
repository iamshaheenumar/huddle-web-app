import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getActiveGroup, listUserGroups } from '@/lib/group'
import type { Member, BudgetCategory, RecentExpense } from './types'
import type { Profile } from '@/types'

type BudgetRow = { id: string; total_amount: number }
type ExpRow = { id: string; amount: number; note: string | null; expense_date: string; category_id: string; paid_by: string; profiles: { display_name: string; avatar_color: string } | null; categories: { name: string; icon: string; color: string; bg_color: string; id: string } | null }
type MemberRow = { user_id: string; profiles: { display_name: string; avatar_color: string } | null }
type BCRow = { allocated_amount: number; categories: { id: string; name: string; icon: string; color: string; bg_color: string } | null }

// One auth + active-group + period resolution per request, shared by every helper below.
export const getDashboardContext = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const group = await getActiveGroup(supabase, user.id)
  const now = new Date()
  return { supabase, user, group, month: now.getMonth() + 1, year: now.getFullYear() }
})

export const getProfile = cache(async (): Promise<Profile | null> => {
  const { supabase, user } = await getDashboardContext()
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  return data as Profile | null
})

export const getGroups = cache(async () => {
  const { supabase, user } = await getDashboardContext()
  return listUserGroups(supabase, user.id)
})

export const getMonthExpenses = cache(async (): Promise<ExpRow[]> => {
  const { supabase, group, month, year } = await getDashboardContext()
  const { data } = await supabase
    .from('expenses')
    .select('*, profiles(display_name, avatar_color), categories(name, icon, color, bg_color)')
    .eq('group_id', group.id)
    .gte('expense_date', `${year}-${String(month).padStart(2, '0')}-01`)
    .order('created_at', { ascending: false })
  return (data as unknown as ExpRow[]) ?? []
})

export const getBudget = cache(async (): Promise<BudgetRow | null> => {
  const { supabase, group, month, year } = await getDashboardContext()
  const { data } = await supabase
    .from('budgets')
    .select('*')
    .eq('group_id', group.id)
    .eq('month', month)
    .eq('year', year)
    .single()
  return data as unknown as BudgetRow | null
})

export const getBudgetSummary = cache(async () => {
  const { month } = await getDashboardContext()
  const [budget, expenses] = await Promise.all([getBudget(), getMonthExpenses()])
  const totalBudget = budget?.total_amount ?? 0
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
  const remaining = totalBudget - totalSpent
  const pctUsed = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0
  return { month, totalBudget, totalSpent, remaining, pctUsed }
})

export const getMembers = cache(async (): Promise<Member[]> => {
  const { supabase, group } = await getDashboardContext()
  const [membersRes, expenses] = await Promise.all([
    supabase.from('group_members').select('user_id, role, profiles(display_name, avatar_color)').eq('group_id', group.id),
    getMonthExpenses(),
  ])
  const rawMembers = (membersRes.data as unknown as MemberRow[]) ?? []
  return rawMembers.map(m => ({
    user_id: m.user_id,
    profile: m.profiles,
    spent: expenses.filter(e => e.paid_by === m.user_id).reduce((s, e) => s + e.amount, 0),
  }))
})

export const getBudgetCategories = cache(async (): Promise<BudgetCategory[]> => {
  const { supabase } = await getDashboardContext()
  const budget = await getBudget()
  if (!budget) return []
  const [{ data: bcData }, expenses] = await Promise.all([
    supabase.from('budget_categories').select('*, categories(id, name, icon, color, bg_color)').eq('budget_id', budget.id),
    getMonthExpenses(),
  ])
  return ((bcData as unknown as BCRow[]) ?? []).map(bc => {
    const cat = bc.categories!
    const consumed = expenses.filter(e => e.category_id === cat?.id).reduce((s, e) => s + e.amount, 0)
    return { allocated_amount: bc.allocated_amount, consumed, category: cat }
  })
})

export const getRecentExpenses = cache(async (): Promise<RecentExpense[]> => {
  const expenses = await getMonthExpenses()
  return expenses.slice(0, 4).map(e => ({
    id: e.id,
    amount: e.amount,
    note: e.note,
    expense_date: e.expense_date,
    profile: e.profiles,
    category: e.categories,
  }))
})
