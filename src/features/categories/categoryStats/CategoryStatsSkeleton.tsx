import { Sk } from '@/features/common/Skeleton'

export default function CategoryStatsSkeleton() {
  return (
    <div className="mx-5 mt-3.5 flex gap-2.5">
      {[0, 1, 2].map(i => (
        <div key={i} className="flex-1 rounded-2xl p-3.5 flex flex-col items-center gap-2" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
          <Sk style={{ width: '60%', height: 11 }} />
          <Sk style={{ width: '70%', height: 17 }} />
        </div>
      ))}
    </div>
  )
}
