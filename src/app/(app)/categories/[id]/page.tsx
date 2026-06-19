import { Suspense } from 'react'
import CategoryHeader from '@/features/categories/categoryHeader/CategoryHeader'
import CategoryHeaderSkeleton from '@/features/categories/categoryHeader/CategoryHeaderSkeleton'
import CategoryRing from '@/features/categories/categoryRing/CategoryRing'
import CategoryRingSkeleton from '@/features/categories/categoryRing/CategoryRingSkeleton'
import CategoryStats from '@/features/categories/categoryStats/CategoryStats'
import CategoryStatsSkeleton from '@/features/categories/categoryStats/CategoryStatsSkeleton'
import CategoryTransactions from '@/features/categories/categoryTransactions/CategoryTransactions'
import CategoryTransactionsSkeleton from '@/features/categories/categoryTransactions/CategoryTransactionsSkeleton'

export default async function CategoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#F6F3EE' }}>
      <Suspense fallback={<CategoryHeaderSkeleton />}>
        <CategoryHeader id={id} />
      </Suspense>
      <Suspense fallback={<CategoryRingSkeleton />}>
        <CategoryRing id={id} />
      </Suspense>
      <Suspense fallback={<CategoryStatsSkeleton />}>
        <CategoryStats id={id} />
      </Suspense>
      <Suspense fallback={<CategoryTransactionsSkeleton />}>
        <CategoryTransactions id={id} />
      </Suspense>
    </div>
  )
}
