import { Sk } from '@/features/common/Skeleton'

export default function BudgetHeroCardSkeleton() {
  return (
    <div
      className="mx-5 mt-4 rounded-3xl p-5"
      style={{ background: 'linear-gradient(152deg,#4D79F8 0%,#3461E8 100%)' }}
    >
      <div className="flex justify-between items-center">
        <Sk style={{ width: 90, height: 13, background: 'rgba(255,255,255,.25)' }} />
        <Sk className="rounded-full" style={{ width: 60, height: 24, background: 'rgba(255,255,255,.2)' }} />
      </div>
      <Sk style={{ width: 160, height: 36, marginTop: 12, background: 'rgba(255,255,255,.25)' }} />
      <Sk style={{ width: 140, height: 13, marginTop: 6, background: 'rgba(255,255,255,.2)' }} />
      <div className="h-2.5 rounded-full mt-4" style={{ background: 'rgba(255,255,255,.2)' }} />
      <div className="flex justify-between mt-3">
        <Sk style={{ width: 80, height: 12, background: 'rgba(255,255,255,.2)' }} />
        <Sk style={{ width: 80, height: 12, background: 'rgba(255,255,255,.2)' }} />
      </div>
    </div>
  )
}
