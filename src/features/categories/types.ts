export type CategoryExpense = {
  // Queued on this device, not yet synced
  pending?: boolean
  id: string
  amount: number
  note: string | null
  expense_date: string
  profile: { display_name: string; avatar_color: string } | null
}
