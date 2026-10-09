import DashboardHeader from '@/features/dashboard/dashboardHeader/DashboardHeader'
import BudgetHeroCard from '@/features/dashboard/budgetHeroCard/BudgetHeroCard'
import DayTransactionsSection from '@/features/dashboard/dayTransactionsSection/DayTransactionsSection'
import CategoriesSection from '@/features/dashboard/categoriesSection/CategoriesSection'
import MembersSection from '@/features/dashboard/membersSection/MembersSection'
import EmptyBudget from '@/features/dashboard/emptyBudget/EmptyBudget'

// Static shell: each section reads the client query cache and shows its own
// skeleton only until it has data.
export default function DashboardPage() {
  return (
    <div className="flex flex-col pb-7">
      <DashboardHeader />
      <BudgetHeroCard />
      <DayTransactionsSection />
      <CategoriesSection />
      <EmptyBudget />
      <MembersSection />
    </div>
  )
}
