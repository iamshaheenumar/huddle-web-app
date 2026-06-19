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

export type RecentExpense = {
  id: string
  amount: number
  note: string | null
  expense_date: string
  profile: { display_name: string; avatar_color: string } | null
  category: { name: string } | null
}
