export type Member = {
  user_id: string
  profile: { display_name: string; avatar_color: string } | null
  spent: number
}

export type BudgetCategory = {
  allocated_amount: number
  consumed: number
  category: { id: string; name: string; icon: string; color: string; bg_color: string }
}

export type DayExpense = {
  id: string
  amount: number
  note: string | null
  created_at: string
  // Queued on this device, not yet synced
  pending?: boolean
  profile: { display_name: string; avatar_color: string } | null
  category: { name: string; icon: string; color: string; bg_color: string } | null
}

export type SpendDay = {
  // null when the group has no expenses on or before today
  date: string | null
  isToday: boolean
  expenses: DayExpense[]
}
