import { Sk } from '@/features/common/Skeleton'

// Everything below the header, which is static.
export default function RecurringScreenSkeleton() {
  return (
    <>
      <Sk className="mx-5 mt-[18px] rounded-[22px]" style={{ height: 118 }} />
      <Sk className="mx-5 mt-4 rounded-[12px]" style={{ height: 38 }} />
      <div className="flex items-center justify-between px-5 pt-5">
        <Sk style={{ width: 90, height: 16 }} />
        <Sk style={{ width: 110, height: 12 }} />
      </div>
      <div className="mx-5 mt-3 rounded-[20px] py-1 px-4" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
        {[0, 1, 2].map(i => (
          <div key={i} className="flex items-center gap-3 py-[13px]" style={{ borderBottom: i < 2 ? '1px solid #F4F0E9' : 'none' }}>
            <Sk className="rounded-[11px] flex-shrink-0" style={{ width: 36, height: 36 }} />
            <div className="flex-1 flex flex-col gap-2">
              <Sk style={{ width: '50%', height: 14 }} />
              <Sk style={{ width: '40%', height: 11 }} />
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Sk style={{ width: 48, height: 14 }} />
              <Sk className="rounded-full" style={{ width: 34, height: 20 }} />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
