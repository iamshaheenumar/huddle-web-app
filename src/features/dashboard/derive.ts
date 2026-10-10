import type { Member, BudgetCategory, SpendDay } from './types'
import type { MemberRow } from '@/features/common/queries'

export type BudgetRow = { id: string; total_amount: number }
export type ExpRow = { id: string; pending?: boolean; recurring_id?: string | null; amount: number; note: string | null; expense_date: string; created_at: string; category_id: string; paid_by: string; profiles: { display_name: string; avatar_color: string } | null; categories: { name: string; icon: string; color: string; bg_color: string } | null }
export type BCRow = { allocated_amount: number; categories: { id: string; name: string; icon: string; color: string; bg_color: string } | null }

export function budgetSummary(budget: BudgetRow | null, expenses: ExpRow[]) {
  const totalBudget = budget?.total_amount ?? 0
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
  const remaining = totalBudget - totalSpent
  const pctUsed = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0
  return { totalBudget, totalSpent, remaining, pctUsed }
}

export function memberSpend(members: MemberRow[], expenses: ExpRow[]): Member[] {
  return members.map(m => ({
    user_id: m.user_id,
    profile: m.profiles,
    spent: expenses.filter(e => e.paid_by === m.user_id).reduce((s, e) => s + e.amount, 0),
  }))
}

export function budgetCategoryUsage(rows: BCRow[], expenses: ExpRow[]): BudgetCategory[] {
  return rows.map(bc => {
    const cat = bc.categories!
    const consumed = expenses.filter(e => e.category_id === cat?.id).reduce((s, e) => s + e.amount, 0)
    return { allocated_amount: bc.allocated_amount, consumed, category: cat }
  })
}

// Latest expense_date on or before `today` among the rows, or null.
export function latestSpendDate(expenses: ExpRow[], today: string): string | null {
  let latest: string | null = null
  for (const e of expenses) {
    if (e.expense_date <= today && (!latest || e.expense_date > latest)) latest = e.expense_date
  }
  return latest
}

// `rows` may span several days; only those on `date` are kept, in their given order.
export function spendDay(date: string | null, rows: ExpRow[], today: string): SpendDay {
  if (!date) return { date: null, isToday: false, expenses: [] }
  return {
    date,
    isToday: date === today,
    expenses: rows
      .filter(e => e.expense_date === date)
      .map(e => ({
        id: e.id,
        amount: e.amount,
        note: e.note,
        created_at: e.created_at,
        pending: e.pending,
        recurring: !!e.recurring_id,
        profile: e.profiles,
        category: e.categories,
      })),
  }
}
