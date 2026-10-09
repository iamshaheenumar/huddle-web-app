'use client'

import { useBudgetSetData } from '../queries'
import BudgetSetForm from '../budgetSetForm/BudgetSetForm'
import BudgetSetSkeleton from '../budgetSetSkeleton/BudgetSetSkeleton'

export default function BudgetSetSection() {
  const data = useBudgetSetData()
  if (!data) return <BudgetSetSkeleton />
  // Keyed so switching groups resets the form's values.
  return <BudgetSetForm key={data.groupId} data={data} />
}
