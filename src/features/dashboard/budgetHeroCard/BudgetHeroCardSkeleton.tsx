import { Sk } from '@/features/common/Skeleton'

export default function BudgetHeroCardSkeleton() {
  return (
    <div className="mx-5 mt-5 rounded-3xl p-5" style={{ background: 'var(--primary)' }}>
      <div className="flex justify-between items-center">
        <Sk style={{ width: 120, height: 13, background: 'rgba(255,255,255,.25)' }} />
        <Sk className="rounded-full" style={{ width: 70, height: 24, background: 'rgba(255,255,255,.18)' }} />
      </div>
      <Sk style={{ width: 190, height: 44, marginTop: 12, background: 'rgba(255,255,255,.25)' }} />
      <Sk style={{ width: 170, height: 13, marginTop: 8, background: 'rgba(255,255,255,.2)' }} />
      <div className="h-2 rounded-full mt-4 mb-5" style={{ background: 'rgba(255,255,255,.22)' }} />
      <div className="flex items-center justify-between mt-2 rounded-2xl px-3.5 py-3" style={{ background: 'rgba(16,22,48,.18)' }}>
        <Sk style={{ width: 130, height: 13, background: 'rgba(255,255,255,.22)' }} />
        <Sk style={{ width: 60, height: 20, background: 'rgba(255,255,255,.22)' }} />
      </div>
    </div>
  )
}
