import { Sk } from '@/features/common/Skeleton'

export default function EarlierMonthsSkeleton() {
  return (
    <>
      <div className="px-5 pt-6"><Sk style={{ width: 120, height: 16 }} /></div>
      <div className="flex flex-col gap-2.5 px-5 mt-3">
        {[0, 1, 2].map(i => (
          <div key={i} className="flex items-center gap-3.5 rounded-[20px] p-3.5" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
            <Sk style={{ width: 46, height: 46, borderRadius: 16 }} />
            <div className="flex-1 flex flex-col gap-1.5">
              <Sk style={{ width: 120, height: 15 }} />
              <Sk style={{ width: '70%', height: 12 }} />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
