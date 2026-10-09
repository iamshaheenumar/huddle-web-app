'use client'

import { useMutationState, type QueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { revalidateAppData } from '@/lib/actions'

export const ADD_EXPENSE = ['expense', 'add'] as const
export const DELETE_EXPENSE = ['expense', 'delete'] as const

// A new expense as queued while (possibly) offline. The id is generated on the
// device so a retried insert can't create a duplicate.
export type ExpenseDraft = {
  id: string
  group_id: string
  category_id: string
  paid_by: string
  amount: number
  note: string | null
  expense_date: string
  created_at: string
  // Display-only joins so the row renders before it syncs; never sent to the server.
  profiles: { display_name: string; avatar_color: string } | null
  categories: { name: string; icon: string; color: string; bg_color: string } | null
}

export type ExpenseDelete = { id: string }

// Registered on the client before the persisted cache is restored, so queued
// mutations saved in a previous session can run again without their component.
export function registerMutationDefaults(queryClient: QueryClient) {
  // Keeps the mutation pending until fresh data has landed, so its optimistic
  // row hands over to the server row without flickering out in between.
  const refreshAfterWrite = () =>
    queryClient.invalidateQueries({ queryKey: ['expenses'] })

  queryClient.setMutationDefaults(ADD_EXPENSE, {
    mutationFn: async (d: ExpenseDraft) => {
      const row = { id: d.id, group_id: d.group_id, category_id: d.category_id, paid_by: d.paid_by, amount: d.amount, note: d.note, expense_date: d.expense_date, created_at: d.created_at }
      const { error } = await createClient().from('expenses').insert(row as never)
      // 23505: an earlier attempt already inserted this id.
      if (error && error.code !== '23505') throw error
    },
    onSuccess: () => { revalidateAppData().catch(() => {}) },
    onSettled: refreshAfterWrite,
    // Writes run one at a time, in order, so a queued delete never overtakes its add.
    scope: { id: 'expenses' },
    retry: 3,
  })

  queryClient.setMutationDefaults(DELETE_EXPENSE, {
    mutationFn: async ({ id }: ExpenseDelete) => {
      // Deleting nothing counts as done: a retry may find it already gone.
      const { error } = await createClient().from('expenses').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { revalidateAppData().catch(() => {}) },
    onSettled: refreshAfterWrite,
    scope: { id: 'expenses' },
    retry: 3,
  })
}

// Expense writes that haven't reached the server yet, for overlaying on cached lists.
export function usePendingExpenseWrites() {
  const adds = useMutationState({
    filters: { mutationKey: ADD_EXPENSE, status: 'pending' },
    select: m => m.state.variables as ExpenseDraft,
  })
  const deletes = useMutationState({
    filters: { mutationKey: DELETE_EXPENSE, status: 'pending' },
    select: m => (m.state.variables as ExpenseDelete).id,
  })
  return { adds, deletedIds: new Set(deletes) }
}

// Merges queued adds into a fetched list (newest first) and hides queued deletes.
// Rows not yet on the server are marked `pending`.
export function applyPendingExpenses<T extends { id: string; created_at: string }>(
  rows: T[],
  adds: T[],
  deletedIds: Set<string>,
): (T & { pending?: boolean })[] {
  const fetched = new Set(rows.map(r => r.id))
  const queued = adds.filter(a => !fetched.has(a.id)).map(a => ({ ...a, pending: true }))
  return [...queued, ...rows]
    .filter(r => !deletedIds.has(r.id))
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
}
