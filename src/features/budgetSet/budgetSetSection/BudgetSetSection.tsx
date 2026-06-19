import { getBudgetSetData } from '../data'
import BudgetSetForm from '../budgetSetForm/BudgetSetForm'

export default async function BudgetSetSection() {
  const data = await getBudgetSetData()
  return <BudgetSetForm data={data} />
}
