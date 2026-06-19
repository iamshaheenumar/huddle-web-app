import { Sk } from '@/features/common/Skeleton'

export default function CategoryTransactionsSkeleton() {
  return (
    <>
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <Sk style={{ width: 90, height: 16 }} />
        <Sk style={{ width: 70, height: 13 }} />
      </div>
      <div className="mx-5 rounded-[20px] py-1 px-4" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3 py-3" style={{ borderBottom: i < 3 ? '1px solid #F4F0E9' : 'none' }}>
            <Sk className="rounded-full flex-shrink-0" style={{ width: 36, height: 36 }} />
            <div className="flex-1 flex flex-col gap-2">
              <Sk style={{ width: '55%', height: 14 }} />
              <Sk style={{ width: '40%', height: 11 }} />
            </div>
            <Sk style={{ width: 48, height: 14 }} />
          </div>
        ))}
      </div>
    </>
  )
}
