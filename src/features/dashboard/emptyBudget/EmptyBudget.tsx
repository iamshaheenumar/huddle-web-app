import Link from 'next/link'
import { MONTHS } from '@/lib/constants'
import { getDashboardContext, getBudget } from '../data'

export default async function EmptyBudget() {
  const [{ month }, budget] = await Promise.all([getDashboardContext(), getBudget()])
  if (budget) return null

  return (
    <div className="mx-5 mt-6 rounded-3xl p-6 text-center" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
      <p className="text-[15px] font-bold mb-3" style={{ color: '#20242E' }}>No budget set for {MONTHS[month - 1]}</p>
      <Link href="/budget/set" className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold text-white" style={{ background: '#3B6FF6' }}>
        Set budget
      </Link>
    </div>
  )
}
