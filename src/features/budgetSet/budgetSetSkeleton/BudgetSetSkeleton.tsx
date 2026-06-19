import { Sk } from '@/features/common/Skeleton'

export default function BudgetSetSkeleton() {
  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#F6F3EE' }}>
      {/* Header */}
      <div className="flex items-center gap-3.5 px-5 pt-12 pb-0">
        <Sk className="rounded-[13px]" style={{ width: 40, height: 40 }} />
        <div className="flex flex-col gap-2">
          <Sk style={{ width: 80, height: 13 }} />
          <Sk style={{ width: 140, height: 19 }} />
        </div>
      </div>
      {/* Total card */}
      <div className="mx-5 mt-5 rounded-3xl p-5" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
        <Sk style={{ width: 140, height: 13 }} />
        <Sk style={{ width: 160, height: 38, marginTop: 6 }} />
        <Sk className="rounded-full" style={{ width: '100%', height: 10, marginTop: 16 }} />
        <div className="flex justify-between mt-3">
          <Sk style={{ width: 90, height: 12 }} />
          <Sk style={{ width: 90, height: 12 }} />
        </div>
      </div>
      {/* Category label */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <Sk style={{ width: 150, height: 16 }} />
        <Sk style={{ width: 40, height: 13 }} />
      </div>
      {/* Category rows */}
      <div className="mx-5 flex flex-col gap-2.5">
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center gap-3.5 rounded-[18px] py-3 px-3.5" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
            <Sk className="rounded-[12px] flex-shrink-0" style={{ width: 40, height: 40 }} />
            <Sk className="flex-1" style={{ height: 14 }} />
            <Sk className="rounded-[11px]" style={{ width: 100, height: 28 }} />
          </div>
        ))}
      </div>
      {/* Save button */}
      <div className="px-5 mt-6">
        <Sk className="rounded-[17px]" style={{ width: '100%', height: 54 }} />
      </div>
    </div>
  )
}
