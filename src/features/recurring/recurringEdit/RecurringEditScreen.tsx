'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useIsMutating } from '@tanstack/react-query'
import ExpenseAddForm from '@/features/expenseAdd/expenseAddForm/ExpenseAddForm'
import ExpenseAddSkeleton from '@/features/expenseAdd/expenseAddSkeleton/ExpenseAddSkeleton'
import { useExpenseAddData } from '@/features/expenseAdd/queries'
import { DELETE_RECURRING, type RecurringDelete } from '@/lib/query/mutations'
import { useRecurring } from '../queries'

// Edits a recurring payment with the add-expense form.
export default function RecurringEditScreen() {
  const { id } = useParams<{ id: string }>()
  const data = useExpenseAddData()
  const rows = useRecurring()
  // Deleting from this screen hides the row before the screen navigates away.
  const deleting = useIsMutating({
    mutationKey: DELETE_RECURRING,
    predicate: m => (m.state.variables as RecurringDelete | undefined)?.id === id,
  })

  if (!data || !rows || deleting > 0) return <ExpenseAddSkeleton />
  const row = rows.find(r => r.id === id)

  if (!row) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-5 text-center" style={{ background: '#F6F3EE' }}>
        <p className="text-[15px] font-bold" style={{ color: '#20242E' }}>This recurring payment isn&apos;t in your group</p>
        <Link href="/recurring" className="mt-3 text-[13px] font-bold" style={{ color: '#3B6FF6' }}>Back to recurring payments</Link>
      </div>
    )
  }

  return <ExpenseAddForm key={`${data.groupId}:${row.id}`} data={data} editing={row} />
}
