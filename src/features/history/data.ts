import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getActiveGroup } from '@/lib/group'
import { MONTHS } from '@/lib/constants'
import type { Period, PeriodSummary, HistoryCategory, EarlierMonth, HistoryMember, HistoryTxn } from './types'

type BudgetRow = { id: string; month: number; year: number; total_amount: number }
type ExpRow = { id: string; note: string | null; amount: number; expense_date: string; category_id: string; paid_by: string; categories: { id: string; name: string; icon: string; color: string; bg_color: string } | null }
type MemberRow = { user_id: string; profiles: { display_name: string; avatar_color: string } | null }
type BCRow = { budget_id: string; allocated_amount: number; categories: { id: string; name: string; icon: string; color: string; bg_color: string } | null }

// Date-badge palette for the "Earlier months" list, cycled by list position.
const ACCENTS = [
  { color: '#2E9E6B', bg: '#E6F4EC' },
  { color: '#E5683E', bg: '#FBE8E1' },
  { color: '#8A5CF0', bg: '#EFE9FD' },
  { color: '#3B6FF6', bg: '#E9F0FE' },
  { color: '#1FA0A6', bg: '#E0F3F4' },
]

export const periodKey = (p: Period) => `${p.year}-${String(p.month).padStart(2, '0')}`
export const periodLabel = (p: Period) => `${MONTHS[p.month - 1]} ${p.year}`
const cmpDesc = (a: Period, b: Period) => b.year - a.year || b.month - a.month
const isBefore = (a: Period, b: Period) => a.year < b.year || (a.year === b.year && a.month < b.month)

// expense_date is a plain 'YYYY-MM-DD' string — parse the parts directly to avoid
// timezone shifts that `new Date(str)` would introduce near month boundaries.
const expensePeriod = (dateStr: string): Period => {
  const [y, m] = dateStr.split('-')
  return { year: Number(y), month: Number(m) }
}

const parsePeriod = (s?: string): Period | null => {
  if (!s) return null
  const m = /^(\d{4})-(\d{1,2})$/.exec(s)
  if (!m) return null
  const year = Number(m[1])
  const month = Number(m[2])
  if (month < 1 || month > 12) return null
  return { year, month }
}

const sumSpent = (expenses: ExpRow[], p: Period) =>
  expenses
    .filter(e => { const q = expensePeriod(e.expense_date); return q.year === p.year && q.month === p.month })
    .reduce((s, e) => s + Number(e.amount), 0)

const toTxn = (e: ExpRow, payer: MemberRow | undefined): HistoryTxn => ({
  id: e.id,
  amount: Number(e.amount),
  note: e.note,
  date: e.expense_date,
  categoryName: e.categories?.name ?? 'Expense',
  payerName: payer?.profiles?.display_name ?? 'Unknown',
  payerColor: payer?.profiles?.avatar_color ?? '#3B6FF6',
})

// One auth + active-group resolution per request, shared by every helper below.
const getBase = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const group = await getActiveGroup(supabase, user.id)
  return { supabase, user, group }
})

// The group's whole expense history — fetched once and aggregated per period in
// JS so every section (tabs, hero, breakdown, earlier months) shares one query.
export const getAllExpenses = cache(async (): Promise<ExpRow[]> => {
  const { supabase, group } = await getBase()
  // PostgREST caps a single response (1000 rows by default), which would silently
  // drop the oldest months — page through until a short page comes back.
  const PAGE = 1000
  const rows: ExpRow[] = []
  for (let from = 0; ; from += PAGE) {
    const { data } = await supabase
      .from('expenses')
      .select('id, note, amount, expense_date, category_id, paid_by, categories(id, name, icon, color, bg_color)')
      .eq('group_id', group.id)
      .order('expense_date', { ascending: false })
      .order('id')
      .range(from, from + PAGE - 1)
    const page = (data as unknown as ExpRow[]) ?? []
    rows.push(...page)
    if (page.length < PAGE) break
  }
  return rows
})

export const getAllBudgets = cache(async (): Promise<BudgetRow[]> => {
  const { supabase, group } = await getBase()
  const { data } = await supabase
    .from('budgets')
    .select('id, month, year, total_amount')
    .eq('group_id', group.id)
  return (data as unknown as BudgetRow[]) ?? []
})

export const getAllBudgetCategories = cache(async (): Promise<BCRow[]> => {
  const budgets = await getAllBudgets()
  if (budgets.length === 0) return []
  const { supabase } = await getBase()
  const { data } = await supabase
    .from('budget_categories')
    .select('budget_id, allocated_amount, categories(id, name, icon, color, bg_color)')
    .in('budget_id', budgets.map(b => b.id))
  return (data as unknown as BCRow[]) ?? []
})

export const getMemberCount = cache(async (): Promise<number> => {
  const { supabase, group } = await getBase()
  const { count } = await supabase
    .from('group_members')
    .select('user_id', { count: 'exact', head: true })
    .eq('group_id', group.id)
  return count ?? 0
})

// Resolves the available periods (every month with a budget or expense, plus the
// current month) and the selected one. Cached on the raw `period` search param so
// all sections passing the same param share a single resolution.
export const getHistoryContext = cache(async (periodParam?: string) => {
  const { supabase, user, group } = await getBase()
  const [budgets, expenses] = await Promise.all([getAllBudgets(), getAllExpenses()])
  const now = new Date()
  const currentPeriod: Period = { year: now.getFullYear(), month: now.getMonth() + 1 }

  const map = new Map<string, Period>()
  map.set(periodKey(currentPeriod), currentPeriod)
  for (const b of budgets) map.set(periodKey({ year: b.year, month: b.month }), { year: b.year, month: b.month })
  for (const e of expenses) { const p = expensePeriod(e.expense_date); map.set(periodKey(p), p) }

  const periods = [...map.values()].sort(cmpDesc)
  const parsed = parsePeriod(periodParam)
  const selected = parsed ?? periods[0] ?? currentPeriod

  return { supabase, user, group, periods, selected, currentPeriod }
})

export const getPeriodSummary = cache(async (periodParam?: string): Promise<PeriodSummary> => {
  const { selected, currentPeriod } = await getHistoryContext(periodParam)
  const [budgets, expenses, memberCount] = await Promise.all([getAllBudgets(), getAllExpenses(), getMemberCount()])
  const budget = budgets.find(b => b.year === selected.year && b.month === selected.month)
  const totalBudget = Number(budget?.total_amount ?? 0)
  const totalSpent = sumSpent(expenses, selected)
  const hasBudget = totalBudget > 0
  const remaining = totalBudget - totalSpent
  const overspent = hasBudget && totalSpent > totalBudget
  const pctUsed = hasBudget ? Math.round((totalSpent / totalBudget) * 100) : 0
  const closed = isBefore(selected, currentPeriod)
  return {
    period: selected,
    label: periodLabel(selected),
    totalSpent,
    totalBudget,
    remaining,
    pctUsed,
    overspent,
    closed,
    active: !closed,
    memberCount,
    hasBudget,
  }
})

export const getPeriodCategories = cache(async (periodParam?: string): Promise<HistoryCategory[]> => {
  const { selected } = await getHistoryContext(periodParam)
  const [budgets, allBc, expenses, members] = await Promise.all([getAllBudgets(), getAllBudgetCategories(), getAllExpenses(), getGroupMembers()])
  const memberById = new Map(members.map(m => [m.user_id, m]))
  const budget = budgets.find(b => b.year === selected.year && b.month === selected.month)

  const byId = new Map<string, HistoryCategory>()
  // Seed allocations from the period's budget so allocated-but-unspent categories still appear.
  if (budget) {
    for (const bc of allBc.filter(x => x.budget_id === budget.id)) {
      if (!bc.categories) continue
      byId.set(bc.categories.id, { category: bc.categories, allocated: Number(bc.allocated_amount), consumed: 0, transactions: [] })
    }
  }
  // Fold in consumption; categories spent without an allocation land with allocated = 0.
  for (const e of expenses) {
    const q = expensePeriod(e.expense_date)
    if (q.year !== selected.year || q.month !== selected.month) continue
    if (!e.categories) continue
    const txn = toTxn(e, memberById.get(e.paid_by))
    const existing = byId.get(e.categories.id)
    if (existing) { existing.consumed += txn.amount; existing.transactions.push(txn) }
    else byId.set(e.categories.id, { category: e.categories, allocated: 0, consumed: txn.amount, transactions: [txn] })
  }

  return [...byId.values()].sort((a, b) => b.allocated - a.allocated || b.consumed - a.consumed)
})

export const getEarlierMonths = cache(async (periodParam?: string): Promise<EarlierMonth[]> => {
  const { selected, periods } = await getHistoryContext(periodParam)
  const [budgets, expenses] = await Promise.all([getAllBudgets(), getAllExpenses()])
  return periods
    .filter(p => isBefore(p, selected))
    .map((p, i) => {
      const budget = budgets.find(b => b.year === p.year && b.month === p.month)
      const totalBudget = Number(budget?.total_amount ?? 0)
      const totalSpent = sumSpent(expenses, p)
      const hasBudget = totalBudget > 0
      return {
        period: p,
        label: periodLabel(p),
        monthAbbr: MONTHS[p.month - 1].slice(0, 3).toUpperCase(),
        yearShort: String(p.year).slice(2),
        totalSpent,
        totalBudget,
        overspent: hasBudget && totalSpent > totalBudget,
        hasBudget,
        accent: ACCENTS[i % ACCENTS.length],
      }
    })
})

export const getGroupMembers = cache(async (): Promise<MemberRow[]> => {
  const { supabase, group } = await getBase()
  const { data } = await supabase
    .from('group_members')
    .select('user_id, profiles(display_name, avatar_color)')
    .eq('group_id', group.id)
  return (data as unknown as MemberRow[]) ?? []
})

export const getPeriodMembers = cache(async (periodParam?: string): Promise<HistoryMember[]> => {
  const { selected } = await getHistoryContext(periodParam)
  const [members, expenses] = await Promise.all([getGroupMembers(), getAllExpenses()])

  const memberById = new Map(members.map(m => [m.user_id, m]))
  const spentBy = new Map<string, number>()
  const txnsBy = new Map<string, HistoryTxn[]>()
  let totalSpent = 0
  for (const e of expenses) {
    const q = expensePeriod(e.expense_date)
    if (q.year !== selected.year || q.month !== selected.month) continue
    spentBy.set(e.paid_by, (spentBy.get(e.paid_by) ?? 0) + Number(e.amount))
    totalSpent += Number(e.amount)
    const list = txnsBy.get(e.paid_by) ?? []
    list.push(toTxn(e, memberById.get(e.paid_by)))
    txnsBy.set(e.paid_by, list)
  }

  return members
    .map(m => {
      const spent = spentBy.get(m.user_id) ?? 0
      return { user_id: m.user_id, profile: m.profiles, spent, share: totalSpent > 0 ? Math.round((spent / totalSpent) * 100) : 0, transactions: txnsBy.get(m.user_id) ?? [] }
    })
    .sort((a, b) => b.spent - a.spent)
})
