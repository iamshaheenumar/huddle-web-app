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
  total: number
  transactions: HistoryTxn[]
}

export type HistoryView = 'transactions' | 'categories' | 'members'
