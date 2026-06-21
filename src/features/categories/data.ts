import { cache } from 'react'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Category } from '@/types'
import type { CategoryExpense } from './types'

type RawExpenseRow = { id: string; amount: number; note: string | null; expense_date: string; profiles: { display_name: string; avatar_color: string } | null }

// Resolves the category + the caller's group + period once per request (keyed by
// category id). Mirrors the original page: group is the caller's first membership.
export const getCategoryContext = cache(async (id: string) => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`

  const [catRes, gmRes] = await Promise.all([
    supabase.from('categories').select('*').eq('id', id).single(),
    supabase.from('group_members').select('group_id, groups(id)').eq('user_id', user.id).limit(1).single(),
  ])

  const category = catRes.data as Category | null
  if (!category) notFound()

  const group = gmRes.data?.groups as unknown as { id: string } | null
  if (!group) redirect('/dashboard')

  return { supabase, user, category, group, month, year, monthStart }
})

export const getCategoryExpenses = cache(async (id: string): Promise<CategoryExpense[]> => {
  const { supabase, group, monthStart } = await getCategoryContext(id)
  const { data } = await supabase
    .from('expenses')
    .select('*, profiles(display_name, avatar_color)')
    .eq('group_id', group.id)
    .eq('category_id', id)
    .gte('expense_date', monthStart)
    .order('expense_date', { ascending: false })
  return ((data as unknown as RawExpenseRow[]) ?? []).map(e => ({
    id: e.id,
    amount: e.amount,
    note: e.note,
    expense_date: e.expense_date,
    profile: e.profiles,
  }))
})

export const getCategoryAllocated = cache(async (id: string): Promise<number> => {
  const { supabase, group, month, year } = await getCategoryContext(id)
  const { data: budget } = await supabase
    .from('budgets')
    .select('id, total_amount')
    .eq('group_id', group.id)
    .eq('month', month)
    .eq('year', year)
    .single()
  if (!budget) return 0
  const bRow = budget as unknown as { id: string }
  const { data: bc } = await supabase
    .from('budget_categories')
    .select('allocated_amount')
    .eq('budget_id', bRow.id)
    .eq('category_id', id)
    .single()
  return (bc as unknown as { allocated_amount: number } | null)?.allocated_amount ?? 0
})

export const getCategorySummary = cache(async (id: string) => {
  const [allocated, expenses] = await Promise.all([getCategoryAllocated(id), getCategoryExpenses(id)])
  const totalConsumed = expenses.reduce((s, e) => s + e.amount, 0)
  const available = allocated - totalConsumed
  const pct = allocated > 0 ? Math.min(100, (totalConsumed / allocated) * 100) : 0
  const pctLeft = 100 - pct
  const overspent = allocated > 0 && totalConsumed > allocated
  const overspendAmount = Math.max(0, totalConsumed - allocated)
  const overspendPct = allocated > 0 ? Math.max(0, ((totalConsumed - allocated) / allocated) * 100) : 0
  // budgetFraction = share of the *filled* ring that is in-budget (used to draw the red overspend segment)
  const budgetFraction = totalConsumed > 0 ? Math.min(100, (allocated / totalConsumed) * 100) : 0
  return { allocated, totalConsumed, available, pct, pctLeft, overspent, overspendAmount, overspendPct, budgetFraction }
})
