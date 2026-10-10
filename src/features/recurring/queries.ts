'use client'

import { useEffect } from 'react'
import { useMutationState, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { revalidateAppData } from '@/lib/actions'
import { useOnline } from '@/lib/query/online'
import { useAppContext } from '@/features/common/queries'
import { todayDate } from '@/features/dashboard/dates'
import { editedPosition, initialPosition, monthlyEquivalent, resumedPosition } from '@/lib/recurring'
import type { RecurringDelete, RecurringDraft, RecurringToggle, RecurringUpdate } from '@/lib/query/mutations'
import type { RecurringExpense } from '@/types'

export type RecurringRow = RecurringExpense & {
  categories: { name: string; icon: string; color: string; bg_color: string } | null
  // Changed on this device, not yet synced
  pending?: boolean
}

const RECURRING_SELECT = '*, categories(name, icon, color, bg_color)'

// Still running: not paused and not past its end.
export const isRunning = (r: RecurringRow) => r.is_active && r.next_due_date !== null

type PendingWrite = { action: string; vars: unknown; at: number }

// Replays queued recurring writes, oldest first, over the fetched rules so the
// list reflects them straight away (and offline). Positions are recomputed with
// the same rules the server uses (src/lib/recurring.ts).
function applyPendingRecurring(rows: RecurringRow[], writes: PendingWrite[], groupId: string, today: string) {
  let out = rows
  for (const { action, vars, at } of [...writes].sort((a, b) => a.at - b.at)) {
    if (action === 'add') {
      const d = vars as RecurringDraft
      if (d.rule.group_id !== groupId || out.some(r => r.id === d.rule.id)) continue
      out = [...out, {
        ...d.rule,
        ...initialPosition(d.rule, today),
        is_active: true,
        created_by: null,
        created_at: d.created_at,
        updated_at: new Date(at).toISOString(),
        categories: d.categories,
        pending: true,
      }]
    } else if (action === 'update') {
      const u = vars as RecurringUpdate
      out = out.map(r => r.id === u.rule.id
        ? { ...r, ...u.rule, ...editedPosition(r, u.rule, today), categories: u.categories ?? r.categories, pending: true }
        : r)
    } else if (action === 'toggle') {
      const t = vars as RecurringToggle
      out = out.map(r => r.id === t.id
        ? { ...r, is_active: t.is_active, ...(t.is_active ? resumedPosition(r, today) : {}), pending: true }
        : r)
    } else if (action === 'delete') {
      const { id } = vars as RecurringDelete
      out = out.filter(r => r.id !== id)
    }
  }
  return out
}

// Running rules by next due date, then ended ones, then paused ones.
function sortRecurring(rows: RecurringRow[]) {
  const rank = (r: RecurringRow) => (isRunning(r) ? 0 : r.is_active ? 1 : 2)
  return [...rows].sort((a, b) =>
    rank(a) - rank(b)
    || (a.next_due_date ?? '').localeCompare(b.next_due_date ?? '')
    || a.created_at.localeCompare(b.created_at))
}

// The group's recurring payments, including writes still queued on this device.
export function useRecurring(): RecurringRow[] | undefined {
  const { group } = useAppContext()
  const writes = useMutationState({
    filters: { mutationKey: ['recurring'], status: 'pending' },
    select: m => ({ action: String(m.options.mutationKey?.[1]), vars: m.state.variables, at: m.state.submittedAt }),
  })
  const { data } = useQuery({
    queryKey: ['recurring', group?.id],
    queryFn: async (): Promise<RecurringRow[]> => {
      const { data, error } = await createClient()
        .from('recurring_expenses')
        .select(RECURRING_SELECT)
        .eq('group_id', group!.id)
        .order('next_due_date', { ascending: true, nullsFirst: false })
      if (error) throw error
      return (data as unknown as RecurringRow[]) ?? []
    },
    enabled: !!group,
  })
  if (data === undefined || !group) return undefined
  return sortRecurring(applyPendingRecurring(data, writes, group.id, todayDate()))
}

export type RecurringSummary = {
  activeCount: number
  pausedCount: number
  monthlyTotal: number
  next: RecurringRow | null
}

export function recurringSummary(rows: RecurringRow[]): RecurringSummary {
  const running = rows.filter(isRunning)
  return {
    activeCount: running.length,
    pausedCount: rows.filter(r => !r.is_active).length,
    monthlyTotal: running.reduce((sum, r) => sum + monthlyEquivalent(Number(r.amount), r.frequency), 0),
    // rows are sorted, so the first running one is due soonest
    next: running[0] ?? null,
  }
}

export function useRecurringSummary(): RecurringSummary | undefined {
  const rows = useRecurring()
  return rows && recurringSummary(rows)
}

const catchUpInFlight = new Set<string>()

// Creates any payments that came due since the daily server job last ran
// (catch_up_recurring in supabase/schema.sql). Runs once per group per day
// while online; it's a cheap no-op on the server when nothing is due.
export function useRecurringCatchUp() {
  const { group } = useAppContext()
  const online = useOnline()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!group || !online || catchUpInFlight.has(group.id)) return
    const key = `huddle-recurring-catchup:${group.id}`
    const today = todayDate()
    try {
      if (localStorage.getItem(key) === today) return
    } catch {}

    catchUpInFlight.add(group.id)
    createClient()
      .rpc('catch_up_recurring', { p_group_id: group.id } as never)
      .then(({ data, error }) => {
        if (error) return
        try { localStorage.setItem(key, today) } catch {}
        if (((data as number | null) ?? 0) > 0) {
          queryClient.invalidateQueries({ queryKey: ['recurring'] })
          queryClient.invalidateQueries({ queryKey: ['expenses'] })
          revalidateAppData().catch(() => {})
        }
      })
      .then(() => catchUpInFlight.delete(group.id), () => catchUpInFlight.delete(group.id))
  }, [group, online, queryClient])
}
