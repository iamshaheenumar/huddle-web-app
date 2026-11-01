import type { TxnKind } from '@/types'

export type Period = { year: number; month: number }

export type PeriodSummary = {
  period: Period
  label: string
  totalSpent: number
  totalBudget: number
  remaining: number
  pctUsed: number
  overspent: boolean
  closed: boolean
  active: boolean
  memberCount: number
  hasBudget: boolean
}

export type HistoryCategory = {
  category: { id: string; name: string; icon: string; color: string; bg_color: string }
  allocated: number
  consumed: number
  transactions: HistoryTxn[]
}

export type EarlierMonth = {
  period: Period
  label: string
  monthAbbr: string
  yearShort: string
  totalSpent: number
  totalBudget: number
  overspent: boolean
  hasBudget: boolean
  income: number
  // income minus spend
  net: number
  accent: { color: string; bg: string }
}

export type HistoryMember = {
  user_id: string
  profile: { display_name: string; avatar_color: string } | null
  spent: number
  share: number
  transactions: HistoryTxn[]
}

export type HistoryTxn = {
  // Queued on this device, not yet synced
  pending?: boolean
  id: string
  kind: TxnKind
  amount: number
  note: string | null
  date: string
  createdAt: string
  payerId: string
  categoryName: string
  category: { id: string; name: string; icon: string; color: string; bg_color: string } | null
  payerName: string
  payerColor: string
}

export type HistoryDay = {
  date: string
  // net: income minus spend
  total: number
  transactions: HistoryTxn[]
}

export type HistoryView = 'transactions' | 'categories' | 'members'

export type CompareSide = {
  period: Period
  key: string
  label: string
  // "Oct" — used where both months sit side by side
  short: string
  spent: number
  income: number
  budget: number
}

export type CompareRow = {
  a: number
  b: number
  // a − b: positive means more spent in a
  delta: number
}

export type CompareCategory = CompareRow & {
  category: { id: string; name: string; icon: string; color: string; bg_color: string }
}

export type CompareMember = CompareRow & {
  user_id: string
  profile: { display_name: string; avatar_color: string } | null
}

export type MonthComparison = {
  a: CompareSide
  b: CompareSide
  // When one of the months is still running, both months' spend up to the same
  // day of the month — a fairer read than a part month against a whole one.
  toDate: { day: number; a: number; b: number } | null
  // a − b, like for like: up to toDate.day while a month is running, else whole months
  delta: number
  // delta as a share of b's spend on the same basis; null when b spent nothing
  pct: number | null
  categories: CompareCategory[]
  members: CompareMember[]
}
