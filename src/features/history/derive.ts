import { MONTHS } from '@/lib/constants'
import type { MemberRow } from '@/features/common/queries'
import type { Period, PeriodSummary, HistoryCategory, EarlierMonth, HistoryMember, HistoryTxn, HistoryDay } from './types'

export type BudgetRow = { id: string; month: number; year: number; total_amount: number }
export type ExpRow = { id: string; pending?: boolean; note: string | null; amount: number; expense_date: string; created_at: string; category_id: string; paid_by: string; categories: { id: string; name: string; icon: string; color: string; bg_color: string } | null }
export type BCRow = { budget_id: string; allocated_amount: number; categories: { id: string; name: string; icon: string; color: string; bg_color: string } | null }
export type HistoryContext = { periods: Period[]; selected: Period; currentPeriod: Period }

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

const inPeriod = (e: ExpRow, p: Period) => {
  const q = expensePeriod(e.expense_date)
  return q.year === p.year && q.month === p.month
}

const parsePeriod = (s?: string | null): Period | null => {
  if (!s) return null
  const m = /^(\d{4})-(\d{1,2})$/.exec(s)
  if (!m) return null
  const year = Number(m[1])
  const month = Number(m[2])
  if (month < 1 || month > 12) return null
  return { year, month }
}

const sumSpent = (expenses: ExpRow[], p: Period) =>
  expenses.filter(e => inPeriod(e, p)).reduce((s, e) => s + Number(e.amount), 0)

const toTxn = (e: ExpRow, payer: MemberRow | undefined): HistoryTxn => ({
  id: e.id,
  pending: e.pending,
  amount: Number(e.amount),
  note: e.note,
  date: e.expense_date,
  createdAt: e.created_at,
  payerId: e.paid_by,
  categoryName: e.categories?.name ?? 'Expense',
  category: e.categories,
  payerName: payer?.profiles?.display_name ?? 'Unknown',
  payerColor: payer?.profiles?.avatar_color ?? '#3B6FF6',
})

// The available periods (every month with a budget or expense, plus the current
// month) and the selected one.
export function historyContext(budgets: BudgetRow[], expenses: ExpRow[], periodParam?: string | null): HistoryContext {
  const now = new Date()
  const currentPeriod: Period = { year: now.getFullYear(), month: now.getMonth() + 1 }

  const map = new Map<string, Period>()
  map.set(periodKey(currentPeriod), currentPeriod)
  for (const b of budgets) map.set(periodKey({ year: b.year, month: b.month }), { year: b.year, month: b.month })
  for (const e of expenses) { const p = expensePeriod(e.expense_date); map.set(periodKey(p), p) }

  const periods = [...map.values()].sort(cmpDesc)
  const selected = parsePeriod(periodParam) ?? periods[0] ?? currentPeriod
  return { periods, selected, currentPeriod }
}

export function periodSummary(ctx: HistoryContext, budgets: BudgetRow[], expenses: ExpRow[], memberCount: number): PeriodSummary {
  const { selected, currentPeriod } = ctx
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
}

export function periodCategories(selected: Period, budgets: BudgetRow[], allBc: BCRow[], expenses: ExpRow[], members: MemberRow[]): HistoryCategory[] {
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
    if (!inPeriod(e, selected) || !e.categories) continue
    const txn = toTxn(e, memberById.get(e.paid_by))
    const existing = byId.get(e.categories.id)
    if (existing) { existing.consumed += txn.amount; existing.transactions.push(txn) }
    else byId.set(e.categories.id, { category: e.categories, allocated: 0, consumed: txn.amount, transactions: [txn] })
  }

  return [...byId.values()].sort((a, b) => b.allocated - a.allocated || b.consumed - a.consumed)
}

export function earlierMonths(ctx: HistoryContext, budgets: BudgetRow[], expenses: ExpRow[]): EarlierMonth[] {
  return ctx.periods
    .filter(p => isBefore(p, ctx.selected))
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
}

export function periodMembers(selected: Period, members: MemberRow[], expenses: ExpRow[]): HistoryMember[] {
  const memberById = new Map(members.map(m => [m.user_id, m]))
  const spentBy = new Map<string, number>()
  const txnsBy = new Map<string, HistoryTxn[]>()
  let totalSpent = 0
  for (const e of expenses) {
    if (!inPeriod(e, selected)) continue
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
}

// The selected month's expenses grouped by day — newest day first, newest entry first within a day.
export function periodTransactions(selected: Period, members: MemberRow[], expenses: ExpRow[]): HistoryDay[] {
  const memberById = new Map(members.map(m => [m.user_id, m]))

  const byDate = new Map<string, HistoryDay>()
  for (const e of expenses) {
    if (!inPeriod(e, selected)) continue
    const txn = toTxn(e, memberById.get(e.paid_by))
    const day = byDate.get(e.expense_date) ?? { date: e.expense_date, total: 0, transactions: [] }
    day.total += txn.amount
    day.transactions.push(txn)
    byDate.set(e.expense_date, day)
  }

  const days = [...byDate.values()].sort((a, b) => b.date.localeCompare(a.date))
  for (const d of days) d.transactions.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return days
}
