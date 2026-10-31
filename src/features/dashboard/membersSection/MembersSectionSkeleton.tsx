import { Sk } from '@/features/common/Skeleton'

export default function MembersSectionSkeleton() {
  return (
    <>
      <div className="flex items-center justify-between px-5 pt-6">
        <Sk style={{ width: 120, height: 17 }} />
        <Sk style={{ width: 45, height: 13 }} />
      </div>
      <div className="mx-5 mt-3 rounded-[22px] p-4" style={{ background: '#fff', border: '1px solid var(--hairline)' }}>
        <Sk className="rounded-full" style={{ width: '100%', height: 10 }} />
        <div className="grid grid-cols-3 gap-3 mt-3.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="flex flex-col gap-1.5">
              <Sk style={{ width: 64, height: 12 }} />
              <Sk style={{ width: 48, height: 15 }} />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
