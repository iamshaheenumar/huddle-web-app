export type MemberStat = {
  user_id: string
  role: string
  profile: { display_name: string; avatar_color: string } | null
  spent: number
  // received this month
  income: number
  txCount: number
  color: string
}
