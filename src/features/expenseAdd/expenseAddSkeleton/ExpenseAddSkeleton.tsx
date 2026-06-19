import { Sk } from '@/features/common/Skeleton'

export default function ExpenseAddSkeleton() {
  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#F6F3EE' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-0">
        <Sk className="rounded-[13px]" style={{ width: 40, height: 40 }} />
        <Sk style={{ width: 100, height: 17 }} />
        <Sk className="rounded-full" style={{ width: 80, height: 30 }} />
      </div>
      {/* Amount */}
      <div className="text-center px-5 pt-7 pb-2 flex flex-col items-center gap-2">
        <Sk style={{ width: 60, height: 13 }} />
        <Sk style={{ width: 160, height: 50, marginTop: 8 }} />
      </div>
      {/* Paid by */}
      <div className="px-5 pt-5">
        <Sk style={{ width: 50, height: 13, marginBottom: 10 }} />
        <div className="flex gap-2.5">
          {[0, 1, 2].map(i => <Sk key={i} className="rounded-full" style={{ width: 38, height: 38 }} />)}
        </div>
      </div>
      {/* Category */}
      <div className="px-5 pt-5">
        <Sk style={{ width: 65, height: 13, marginBottom: 10 }} />
        <div className="flex flex-wrap gap-2.5">
          {[0, 1, 2, 3, 4, 5].map(i => <Sk key={i} className="rounded-[13px]" style={{ width: 90, height: 38 }} />)}
        </div>
      </div>
      {/* Note + date */}
      <div className="px-5 pt-5 flex flex-col gap-2.5">
        <Sk className="rounded-[15px]" style={{ width: '100%', height: 50 }} />
        <Sk className="rounded-[15px]" style={{ width: '100%', height: 50 }} />
      </div>
      {/* Add button */}
      <div className="px-5 mt-auto pt-6">
        <Sk className="rounded-[17px]" style={{ width: '100%', height: 54 }} />
      </div>
    </div>
  )
}
