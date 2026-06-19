import { Sk } from '@/features/common/Skeleton'

export default function MembersSectionSkeleton() {
  return (
    <>
      <div className="flex items-center justify-between px-5 pt-5">
        <Sk style={{ width: 70, height: 16 }} />
        <Sk style={{ width: 45, height: 13 }} />
      </div>
      <div className="flex gap-2.5 px-5 mt-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex-1 rounded-[18px] p-3 flex flex-col items-center gap-2"
            style={{ background: '#fff', border: '1px solid #F0ECE4' }}
          >
            <Sk className="rounded-full" style={{ width: 38, height: 38 }} />
            <Sk style={{ width: '60%', height: 12 }} />
            <Sk style={{ width: '50%', height: 13 }} />
          </div>
        ))}
      </div>
    </>
  )
}
