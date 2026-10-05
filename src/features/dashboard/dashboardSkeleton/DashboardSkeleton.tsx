import DashboardHeaderSkeleton from '../dashboardHeader/DashboardHeaderSkeleton'
import BudgetHeroCardSkeleton from '../budgetHeroCard/BudgetHeroCardSkeleton'
import DayTransactionsSectionSkeleton from '../dayTransactionsSection/DayTransactionsSectionSkeleton'
import CategoriesSectionSkeleton from '../categoriesSection/CategoriesSectionSkeleton'
import MembersSectionSkeleton from '../membersSection/MembersSectionSkeleton'

export default function DashboardSkeleton() {
  return (
    <div className="flex flex-col pb-7">
      <DashboardHeaderSkeleton />
      <BudgetHeroCardSkeleton />
      <DayTransactionsSectionSkeleton />
      <CategoriesSectionSkeleton />
      <MembersSectionSkeleton />
    </div>
  )
}
