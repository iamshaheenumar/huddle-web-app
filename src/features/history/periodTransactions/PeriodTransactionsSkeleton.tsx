import { Sk } from '@/features/common/Skeleton'

export default function PeriodTransactionsSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-5 mt-4">
      {[3, 2].map((rows, g) => (
        <div key={g}>
          <div className="flex items-center justify-between px-1">
            <Sk style={{ width: 90, height: 13 }} />
            <Sk style={{ width: 60, height: 12 }} />
          </div>
          <div className="mt-2 rounded-[22px] px-4" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
            {Array.from({ length: rows }, (_, i) => (
              <div key={i} className="flex items-center gap-3 py-[13px]" style={{ borderBottom: i < rows - 1 ? '1px solid #F4F0E9' : 'none' }}>
                <Sk className="rounded-[12px] flex-shrink-0" style={{ width: 40, height: 40 }} />
                <div className="flex-1 flex flex-col gap-2">
                  <Sk style={{ width: '55%', height: 15 }} />
                  <Sk style={{ width: '40%', height: 12 }} />
                </div>
                <Sk style={{ width: 48, height: 16 }} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
