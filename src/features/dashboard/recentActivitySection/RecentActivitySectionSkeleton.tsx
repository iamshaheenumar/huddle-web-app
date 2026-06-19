import { Sk } from '@/features/common/Skeleton'

export default function RecentActivitySectionSkeleton() {
  return (
    <>
      <div className="px-5 pt-5">
        <Sk style={{ width: 110, height: 16 }} />
      </div>
      <div className="mx-5 mt-3 flex flex-col gap-2.5 pb-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl p-3"
            style={{ background: '#fff', border: '1px solid #F0ECE4' }}
          >
            <Sk className="rounded-full flex-shrink-0" style={{ width: 34, height: 34 }} />
            <div className="flex-1 flex flex-col gap-2">
              <Sk style={{ width: '55%', height: 13 }} />
              <Sk style={{ width: '40%', height: 11 }} />
            </div>
            <Sk style={{ width: 48, height: 14 }} />
          </div>
        ))}
      </div>
    </>
  )
}
