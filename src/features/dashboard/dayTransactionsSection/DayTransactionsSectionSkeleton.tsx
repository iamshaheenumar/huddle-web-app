import { Sk } from '@/features/common/Skeleton'

export default function DayTransactionsSectionSkeleton() {
  return (
    <>
      <div className="flex items-center justify-between px-5 pt-6">
        <Sk style={{ width: 160, height: 17 }} />
        <Sk style={{ width: 45, height: 13 }} />
      </div>
      <div className="mx-5 mt-3 rounded-[22px] py-1 px-4" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-[13px]"
            style={{ borderBottom: i < 2 ? '1px solid #F4F0E9' : 'none' }}
          >
            <Sk className="rounded-[12px] flex-shrink-0" style={{ width: 40, height: 40 }} />
            <div className="flex-1 flex flex-col gap-2">
              <Sk style={{ width: '55%', height: 15 }} />
              <Sk style={{ width: '70%', height: 12 }} />
            </div>
            <Sk style={{ width: 48, height: 16 }} />
          </div>
        ))}
      </div>
    </>
  )
}
