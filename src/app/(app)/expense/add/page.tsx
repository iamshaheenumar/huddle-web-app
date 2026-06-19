import { Suspense } from 'react'
import ExpenseAddSection from '@/features/expenseAdd/expenseAddSection/ExpenseAddSection'
import ExpenseAddSkeleton from '@/features/expenseAdd/expenseAddSkeleton/ExpenseAddSkeleton'

export default function AddExpensePage() {
  return (
    <Suspense fallback={<ExpenseAddSkeleton />}>
      <ExpenseAddSection />
    </Suspense>
  )
}
