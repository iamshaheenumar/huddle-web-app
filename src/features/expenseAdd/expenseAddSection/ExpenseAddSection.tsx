'use client'

import { useExpenseAddData } from '../queries'
import ExpenseAddForm from '../expenseAddForm/ExpenseAddForm'
import ExpenseAddSkeleton from '../expenseAddSkeleton/ExpenseAddSkeleton'

export default function ExpenseAddSection() {
  const data = useExpenseAddData()
  if (!data) return <ExpenseAddSkeleton />
  // Keyed so switching groups resets the form's selections.
  return <ExpenseAddForm key={data.groupId} data={data} />
}
