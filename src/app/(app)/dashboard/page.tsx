import { Suspense } from 'react'
import DashboardHeader from '@/features/dashboard/dashboardHeader/DashboardHeader'
import DashboardHeaderSkeleton from '@/features/dashboard/dashboardHeader/DashboardHeaderSkeleton'
import BudgetHeroCard from '@/features/dashboard/budgetHeroCard/BudgetHeroCard'
import BudgetHeroCardSkeleton from '@/features/dashboard/budgetHeroCard/BudgetHeroCardSkeleton'
import DayTransactionsSection from '@/features/dashboard/dayTransactionsSection/DayTransactionsSection'
import DayTransactionsSectionSkeleton from '@/features/dashboard/dayTransactionsSection/DayTransactionsSectionSkeleton'
import CategoriesSection from '@/features/dashboard/categoriesSection/CategoriesSection'
import CategoriesSectionSkeleton from '@/features/dashboard/categoriesSection/CategoriesSectionSkeleton'
import MembersSection from '@/features/dashboard/membersSection/MembersSection'
import MembersSectionSkeleton from '@/features/dashboard/membersSection/MembersSectionSkeleton'
import EmptyBudget from '@/features/dashboard/emptyBudget/EmptyBudget'

export default function DashboardPage() {
  return (
    <div className="flex flex-col pb-7">
      <Suspense fallback={<DashboardHeaderSkeleton />}>
        <DashboardHeader />
      </Suspense>
      <Suspense fallback={<BudgetHeroCardSkeleton />}>
        <BudgetHeroCard />
      </Suspense>
      <Suspense fallback={<DayTransactionsSectionSkeleton />}>
        <DayTransactionsSection />
      </Suspense>
      <Suspense fallback={<CategoriesSectionSkeleton />}>
        <CategoriesSection />
      </Suspense>
      <Suspense fallback={null}>
        <EmptyBudget />
      </Suspense>
      <Suspense fallback={<MembersSectionSkeleton />}>
        <MembersSection />
      </Suspense>
    </div>
  )
}
