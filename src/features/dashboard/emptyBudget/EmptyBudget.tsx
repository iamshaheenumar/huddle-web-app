'use client'

import Link from 'next/link'
import HuddleMark from '@/features/common/HuddleMark'
import { MONTHS } from '@/lib/constants'
import { useAppContext } from '@/features/common/queries'
import { useBudget } from '../queries'

export default function EmptyBudget() {
  const { month } = useAppContext()
  const { data: budget } = useBudget()
  // undefined = still loading, null = no budget this month.
  if (budget !== null) return null

  return (
    <div className="mx-5 mt-6 rounded-3xl p-6 text-center" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
      <HuddleMark size={48} variant="soft" className="block mx-auto mb-3" />
      <p className="text-[15px] font-bold mb-3" style={{ color: '#20242E' }}>No budget set for {MONTHS[month - 1]}</p>
      <Link href="/budget/set" className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold text-white" style={{ background: '#3B6FF6' }}>
        Set budget
      </Link>
    </div>
  )
}
