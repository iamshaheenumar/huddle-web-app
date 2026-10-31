import { Sk } from '@/features/common/Skeleton'

export default function ExpenseAddSkeleton() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F6F3EE' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-0">
        <Sk className="rounded-[14px]" style={{ width: 44, height: 44 }} />
        <div className="flex flex-col items-center gap-1.5">
          <Sk style={{ width: 100, height: 17 }} />
          <Sk style={{ width: 60, height: 12 }} />
        </div>
        <div style={{ width: 44, height: 44 }} />
      </div>
      {/* Kind toggle */}
      <div className="mx-5 mt-4">
        <Sk className="rounded-[13px]" style={{ width: '100%', height: 42 }} />
      </div>
      {/* Amount */}
      <div className="text-center px-5 pt-6 pb-1 flex flex-col items-center gap-2">
        <Sk style={{ width: 60, height: 13 }} />
        <Sk style={{ width: 140, height: 48, marginTop: 6 }} />
      </div>
      {/* Paid by */}
      <div className="px-5 pt-5">
        <Sk style={{ width: 50, height: 13, marginBottom: 10 }} />
        <div className="flex gap-2">
          {[0, 1, 2].map(i => <Sk key={i} className="rounded-full" style={{ width: 92, height: 44 }} />)}
        </div>
      </div>
      {/* Category */}
      <div className="px-5 pt-5">
        <Sk style={{ width: 65, height: 13, marginBottom: 10 }} />
        <div className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3, 4, 5].map(i => <Sk key={i} className="rounded-[16px]" style={{ width: '100%', height: 80 }} />)}
        </div>
      </div>
      {/* Note + date */}
      <div className="px-5 pt-5 flex flex-col gap-2.5">
        <Sk className="rounded-[15px]" style={{ width: '100%', height: 50 }} />
        <div className="flex gap-2">
          {[64, 88, 104].map(w => <Sk key={w} className="rounded-full" style={{ width: w, height: 40 }} />)}
        </div>
      </div>
      {/* Add button */}
      <div className="px-5 mt-auto pt-6 pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <Sk className="rounded-[17px]" style={{ width: '100%', height: 54 }} />
      </div>
    </div>
  )
}
