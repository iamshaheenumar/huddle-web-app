import { Suspense } from 'react'
import BudgetSetSection from '@/features/budgetSet/budgetSetSection/BudgetSetSection'
import BudgetSetSkeleton from '@/features/budgetSet/budgetSetSkeleton/BudgetSetSkeleton'

export default function SetBudgetPage() {
  return (
    <Suspense fallback={<BudgetSetSkeleton />}>
      <BudgetSetSection />
    </Suspense>
  )
}
