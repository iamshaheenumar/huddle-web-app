import { getExpenseAddData } from '../data'
import ExpenseAddForm from '../expenseAddForm/ExpenseAddForm'

export default async function ExpenseAddSection() {
  const data = await getExpenseAddData()
  return <ExpenseAddForm data={data} />
}
