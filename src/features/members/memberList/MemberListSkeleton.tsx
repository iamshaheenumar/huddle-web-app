import { Sk } from '@/features/common/Skeleton'

export default function MemberListSkeleton() {
  return (
    <>
      <div className="px-5 pt-5 pb-3">
        <Sk style={{ width: 140, height: 16 }} />
      </div>
      <div className="mx-5 flex flex-col gap-2.5">
        {[0, 1, 2].map(i => (
          <div key={i} className="rounded-[18px] p-3.5" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
            <div className="flex items-center gap-3">
              <Sk className="rounded-full flex-shrink-0" style={{ width: 40, height: 40 }} />
              <div className="flex-1 flex flex-col gap-2">
                <Sk style={{ width: '50%', height: 14 }} />
                <Sk style={{ width: '30%', height: 11 }} />
              </div>
              <Sk style={{ width: 48, height: 16 }} />
            </div>
            <Sk className="rounded-full mt-3" style={{ width: '100%', height: 6 }} />
          </div>
        ))}
      </div>
    </>
  )
}
