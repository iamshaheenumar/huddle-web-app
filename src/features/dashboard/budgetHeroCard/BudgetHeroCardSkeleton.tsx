import { Sk } from '@/features/common/Skeleton'

export default function BudgetHeroCardSkeleton() {
  return (
    <div
      className="mx-5 mt-5 rounded-3xl px-5 pt-[22px] pb-5"
      style={{ background: 'linear-gradient(152deg,#4D79F8 0%,#3461E8 100%)' }}
    >
      <div className="flex justify-between items-center">
        <Sk style={{ width: 100, height: 13, background: 'rgba(255,255,255,.25)' }} />
        <Sk className="rounded-full" style={{ width: 70, height: 26, background: 'rgba(255,255,255,.18)' }} />
      </div>
      <Sk style={{ width: 190, height: 44, marginTop: 10, background: 'rgba(255,255,255,.25)' }} />
      <Sk style={{ width: 150, height: 13, marginTop: 8, background: 'rgba(255,255,255,.2)' }} />
      <div className="h-2 rounded-full mt-4" style={{ background: 'rgba(255,255,255,.22)' }} />
      <div className="flex items-center justify-between mt-4 rounded-2xl px-3.5 py-3" style={{ background: 'rgba(255,255,255,.14)' }}>
        <div className="flex flex-col gap-1.5">
          <Sk style={{ width: 120, height: 12, background: 'rgba(255,255,255,.22)' }} />
          <Sk style={{ width: 150, height: 12, background: 'rgba(255,255,255,.18)' }} />
        </div>
        <Sk style={{ width: 70, height: 20, background: 'rgba(255,255,255,.22)' }} />
      </div>
    </div>
  )
}
