import { Sk } from '@/features/common/Skeleton'

export default function ProfileSkeleton() {
  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#F6F3EE' }}>
      <div className="px-5 pt-12 pb-0">
        <div className="flex items-center gap-4 mb-8">
          <Sk className="rounded-2xl" style={{ width: 56, height: 56 }} />
          <div className="flex flex-col gap-2">
            <Sk style={{ width: 70, height: 24 }} />
            <Sk style={{ width: 90, height: 14 }} />
          </div>
        </div>
        <div className="rounded-3xl p-5 mb-4" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
          <div className="flex items-center gap-4">
            <Sk className="rounded-full" style={{ width: 56, height: 56 }} />
            <div className="flex flex-col gap-2">
              <Sk style={{ width: 120, height: 18 }} />
              <Sk style={{ width: 60, height: 14 }} />
            </div>
          </div>
          <div className="mt-4">
            <Sk style={{ width: 80, height: 12, marginBottom: 10 }} />
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4, 5].map(i => (
                <Sk key={i} className="rounded-full" style={{ width: 32, height: 32 }} />
              ))}
            </div>
          </div>
        </div>
        <Sk className="rounded-2xl" style={{ width: '100%', height: 54 }} />
      </div>
    </div>
  )
}
