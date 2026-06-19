import CategoryHeaderSkeleton from '../categoryHeader/CategoryHeaderSkeleton'
import CategoryRingSkeleton from '../categoryRing/CategoryRingSkeleton'
import CategoryStatsSkeleton from '../categoryStats/CategoryStatsSkeleton'
import CategoryTransactionsSkeleton from '../categoryTransactions/CategoryTransactionsSkeleton'

export default function CategorySkeleton() {
  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#F6F3EE' }}>
      <CategoryHeaderSkeleton />
      <CategoryRingSkeleton />
      <CategoryStatsSkeleton />
      <CategoryTransactionsSkeleton />
    </div>
  )
}
