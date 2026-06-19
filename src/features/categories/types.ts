export type CategoryExpense = {
  id: string
  amount: number
  note: string | null
  expense_date: string
  profile: { display_name: string; avatar_color: string } | null
}
