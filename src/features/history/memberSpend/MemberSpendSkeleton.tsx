import { Sk } from '@/features/common/Skeleton'

export default function MemberSpendSkeleton() {
  return (
    <>
      <div className="px-5 pt-6"><Sk style={{ width: 130, height: 16 }} /></div>
      <div className="flex flex-col gap-2.5 px-5 mt-3">
        {[0, 1].map(i => (
          <div key={i} className="rounded-[20px] p-4" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
            <div className="flex items-center gap-3">
              <Sk className="rounded-full" style={{ width: 38, height: 38 }} />
              <div className="flex-1">
                <div className="flex justify-between">
                  <Sk style={{ width: 90, height: 14 }} />
                  <Sk style={{ width: 70, height: 13 }} />
                </div>
                <Sk className="rounded-full" style={{ width: '100%', height: 6, marginTop: 12 }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
