'use client'

import { useMutationState, type QueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { revalidateAppData } from '@/lib/actions'
import type { EndType, Frequency } from '@/types'

export const ADD_EXPENSE = ['expense', 'add'] as const
export const DELETE_EXPENSE = ['expense', 'delete'] as const
export const ADD_RECURRING = ['recurring', 'add'] as const
export const UPDATE_RECURRING = ['recurring', 'update'] as const
export const TOGGLE_RECURRING = ['recurring', 'toggle'] as const
export const DELETE_RECURRING = ['recurring', 'delete'] as const

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
  recurring_id?: string | null
  // Display-only joins so the row renders before it syncs; never sent to the server.
  profiles: { display_name: string; avatar_color: string } | null
  categories: { name: string; icon: string; color: string; bg_color: string } | null
}

export type ExpenseDelete = { id: string }

type CategoryDisplay = { name: string; icon: string; color: string; bg_color: string }

// A recurring payment's editable fields, as sent to create/update_recurring_expense().
export type RecurringRule = {
  id: string
  group_id: string
  category_id: string
  paid_by: string
  amount: number
  note: string | null
  frequency: Frequency
  start_date: string
  end_type: EndType
  end_date: string | null
  max_occurrences: number | null
}

// A new recurring payment. `firstExpense` is today's payment when it starts
// today or earlier; the server creates it with this same id, so the queued row
// hands over to the real one without a duplicate.
export type RecurringDraft = {
  rule: RecurringRule
  created_at: string
  // Display-only, never sent.
  categories: CategoryDisplay | null
  firstExpense: ExpenseDraft | null
}

export type RecurringUpdate = { rule: RecurringRule; categories: CategoryDisplay | null }
export type RecurringToggle = { id: string; is_active: boolean }
export type RecurringDelete = { id: string }

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

  const refreshAfterRecurringWrite = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['recurring'] }),
      queryClient.invalidateQueries({ queryKey: ['expenses'] }),
    ])

  // Recurring writes share the expenses scope: creating a rule also creates its
  // first payment, and a later delete of that payment must not overtake it.
  const recurringWrite = {
    onSuccess: () => { revalidateAppData().catch(() => {}) },
    onSettled: refreshAfterRecurringWrite,
    scope: { id: 'expenses' },
    retry: 3,
  }

  queryClient.setMutationDefaults(ADD_RECURRING, {
    mutationFn: async ({ rule, firstExpense }: RecurringDraft) => {
      const { error } = await createClient().rpc('create_recurring_expense', {
        p_rule: rule,
        p_first_expense_id: firstExpense?.id ?? null,
        p_first_created_at: firstExpense?.created_at ?? null,
      } as never)
      if (error) throw error
    },
    ...recurringWrite,
  })

  queryClient.setMutationDefaults(UPDATE_RECURRING, {
    mutationFn: async ({ rule }: RecurringUpdate) => {
      const { error } = await createClient().rpc('update_recurring_expense', { p_rule: rule } as never)
      if (error) throw error
    },
    ...recurringWrite,
  })

  queryClient.setMutationDefaults(TOGGLE_RECURRING, {
    mutationFn: async ({ id, is_active }: RecurringToggle) => {
      const { error } = await createClient().rpc('set_recurring_active', { p_id: id, p_active: is_active } as never)
      if (error) throw error
    },
    ...recurringWrite,
  })

  queryClient.setMutationDefaults(DELETE_RECURRING, {
    mutationFn: async ({ id }: RecurringDelete) => {
      // Past payments stay: their recurring_id is set to null.
      const { error } = await createClient().from('recurring_expenses').delete().eq('id', id)
      if (error) throw error
    },
    ...recurringWrite,
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
  const expenseAdds = useMutationState({
    filters: { mutationKey: ADD_EXPENSE, status: 'pending' },
    select: m => m.state.variables as ExpenseDraft,
  })
  // A new recurring payment's first payment shows like any queued expense.
  const recurringFirsts = useMutationState({
    filters: { mutationKey: ADD_RECURRING, status: 'pending' },
    select: m => (m.state.variables as RecurringDraft).firstExpense,
  })
  const adds = [...expenseAdds, ...recurringFirsts.filter((e): e is ExpenseDraft => e !== null)]
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
