import { Suspense } from 'react'
import CompareScreen from '@/features/history/compareScreen/CompareScreen'
import CompareHeader from '@/features/history/compareHeader/CompareHeader'
import ComparePickerSkeleton from '@/features/history/comparePicker/ComparePickerSkeleton'
import CompareSummarySkeleton from '@/features/history/compareSummary/CompareSummarySkeleton'
import CategoryBreakdownSkeleton from '@/features/history/categoryBreakdown/CategoryBreakdownSkeleton'

// Static shell. The screen reads ?a and ?b on the client, which needs a
// Suspense boundary so the rest of the page can still be prerendered.
export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col min-h-screen pb-24" style={{ background: 'var(--background)' }}>
          <CompareHeader />
          <ComparePickerSkeleton />
          <CompareSummarySkeleton />
          <CategoryBreakdownSkeleton />
        </div>
      }
    >
      <CompareScreen />
    </Suspense>
  )
}
