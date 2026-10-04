import { Sk } from '@/features/common/Skeleton'

export default function MembersSectionSkeleton() {
  return (
    <>
      <div className="flex items-center justify-between px-5 pt-6">
        <Sk style={{ width: 80, height: 17 }} />
        <Sk style={{ width: 45, height: 13 }} />
      </div>
      <div className="mx-5 mt-3 rounded-[22px] py-1 px-4" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
        {[0, 1].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-3"
            style={{ borderBottom: i < 1 ? '1px solid #F4F0E9' : 'none' }}
          >
            <Sk className="rounded-full flex-shrink-0" style={{ width: 34, height: 34 }} />
            <Sk className="flex-1" style={{ height: 14 }} />
            <Sk style={{ width: 28, height: 12 }} />
            <Sk style={{ width: 44, height: 14 }} />
          </div>
        ))}
      </div>
    </>
  )
}
