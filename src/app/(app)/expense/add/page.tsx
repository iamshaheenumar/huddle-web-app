import { Suspense } from 'react'
import ExpenseAddSection from '@/features/expenseAdd/expenseAddSection/ExpenseAddSection'
import ExpenseAddSkeleton from '@/features/expenseAdd/expenseAddSkeleton/ExpenseAddSkeleton'

// Static shell: the form reads members and categories from the client cache.
// It also reads ?recurring, which needs a Suspense boundary so the rest of the
// page can still be prerendered.
export default function AddExpensePage() {
  return (
    <Suspense fallback={<ExpenseAddSkeleton />}>
      <ExpenseAddSection />
    </Suspense>
  )
}
