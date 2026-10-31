import { fmt } from './format'
import type { TxnKind } from '@/types'

// Text colour: brightens in dark mode (the --income fill doesn't).
export const INCOME_COLOR = 'var(--income-text)'

// Rows cached or queued before income existed have no kind; they're expenses.
export const isIncome = (t: { kind?: TxnKind | null }) => t.kind === 'income'

// "+60" for income, "−50" for an expense.
export const signedAmount = (t: { kind?: TxnKind | null; amount: number }) =>
  `${isIncome(t) ? '+' : '−'}${fmt(t.amount)}`

// "+1,697", "−320" or "0".
export const signedNet = (n: number) => (n > 0 ? '+' : n < 0 ? '−' : '') + fmt(Math.abs(n))

export type CashFlow = { income: number; spent: number; net: number }

export function cashFlow(rows: { kind?: TxnKind | null; amount: number }[]): CashFlow {
  let income = 0
  let spent = 0
  for (const r of rows) {
    if (isIncome(r)) income += Number(r.amount)
    else spent += Number(r.amount)
  }
  return { income, spent, net: income - spent }
}
