'use client'

import { useAppContext, useGroupMembers } from '@/features/common/queries'
import { useBudget, useMonthExpenses } from '@/features/dashboard/queries'
import type { MemberStat } from './types'

// Fallback color sequence used when a member has no avatar_color (5 colors,
// intentionally distinct from lib/constants MEMBER_COLORS).
const MEMBER_COLORS_PALETTE = ['#3B6FF6', '#2E9E6B', '#E5683E', '#8A5CF0', '#1FA0A6']

// Members sorted by this month's spend (desc) with a resolved display color, so
// the total-card bar and the member list share an identical index→color mapping.
// Shares the dashboard's month-expenses query, queued writes included.
export function useMemberStats(): MemberStat[] | undefined {
  const { data: members } = useGroupMembers()
  const expenses = useMonthExpenses()
  if (!members || !expenses) return undefined
  return members
    .map(m => {
      const memberExpenses = expenses.filter(e => e.paid_by === m.user_id)
      return {
        user_id: m.user_id,
        role: m.role,
        profile: m.profiles,
        spent: memberExpenses.reduce((s, e) => s + e.amount, 0),
        txCount: memberExpenses.length,
      }
    })
    .sort((a, b) => b.spent - a.spent)
    .map((m, i) => ({ ...m, color: m.profile?.avatar_color ?? MEMBER_COLORS_PALETTE[i % MEMBER_COLORS_PALETTE.length] }))
}

export function useIsOwner(): boolean | undefined {
  const { user } = useAppContext()
  const { data: members } = useGroupMembers()
  if (!user || !members) return undefined
  return members.some(m => m.user_id === user.id && m.role === 'owner')
}

export function useMembersSummary() {
  const { month } = useAppContext()
  const { data: budget } = useBudget()
  const expenses = useMonthExpenses()
  const members = useMemberStats()
  if (budget === undefined || !expenses || !members) return undefined
  const totalBudget = budget?.total_amount ?? 0
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0)
  const pctUsed = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0
  return { month, totalSpent, totalBudget, pctUsed, memberCount: members.length }
}
