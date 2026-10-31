'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import CategoryHeader from '../categoryHeader/CategoryHeader'
import CategoryRing from '../categoryRing/CategoryRing'
import CategoryStats from '../categoryStats/CategoryStats'
import CategoryTransactions from '../categoryTransactions/CategoryTransactions'
import { useCategoryDetail } from '../queries'

export default function CategoryScreen() {
  const { id } = useParams<{ id: string }>()
  const detail = useCategoryDetail(id)

  if (detail && !detail.category) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-5 text-center" style={{ background: 'var(--background)' }}>
        <p className="text-[15px] font-bold" style={{ color: 'var(--ink)' }}>This category isn&apos;t in your group</p>
        <Link href="/dashboard" className="mt-3 text-[13px] font-bold" style={{ color: 'var(--primary)' }}>Back to dashboard</Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: 'var(--background)' }}>
      <CategoryHeader id={id} />
      <CategoryRing id={id} />
      <CategoryStats id={id} />
      <CategoryTransactions id={id} />
    </div>
  )
}
