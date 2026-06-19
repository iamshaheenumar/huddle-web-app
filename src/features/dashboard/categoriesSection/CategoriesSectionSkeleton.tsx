import { Sk } from '@/features/common/Skeleton'

export default function CategoriesSectionSkeleton() {
  return (
    <>
      <div className="flex items-center justify-between px-5 pt-5">
        <Sk style={{ width: 80, height: 16 }} />
        <Sk style={{ width: 70, height: 13 }} />
      </div>
      <div
        className="mx-5 mt-3 rounded-[22px] py-1.5 px-4"
        style={{ background: '#fff', border: '1px solid #F0ECE4' }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-3"
            style={{ borderBottom: i < 3 ? '1px solid #F4F0E9' : 'none' }}
          >
            <Sk className="rounded-[11px] flex-shrink-0" style={{ width: 36, height: 36 }} />
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex justify-between">
                <Sk style={{ width: 80, height: 14 }} />
                <Sk style={{ width: 60, height: 14 }} />
              </div>
              <Sk className="rounded-full" style={{ width: '100%', height: 6 }} />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
