'use client'

import { useSearchParams } from 'next/navigation'
import { useExpenseAddData } from '../queries'
import ExpenseAddForm from '../expenseAddForm/ExpenseAddForm'
import ExpenseAddSkeleton from '../expenseAddSkeleton/ExpenseAddSkeleton'

export default function ExpenseAddSection() {
  const data = useExpenseAddData()
  // ?recurring=1 opens the form with the recurring toggle on.
  const params = useSearchParams()
  const startRecurring = params.get('recurring') === '1'
  // ?kind=income opens the form on the Income tab.
  const startIncome = params.get('kind') === 'income'
  if (!data) return <ExpenseAddSkeleton />
  // Keyed so switching groups resets the form's selections.
  return <ExpenseAddForm key={data.groupId} data={data} startRecurring={startRecurring} startIncome={startIncome} />
}
