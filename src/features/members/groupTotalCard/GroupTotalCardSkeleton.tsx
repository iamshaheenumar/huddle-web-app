import { Sk } from '@/features/common/Skeleton'

export default function GroupTotalCardSkeleton() {
  return (
    <div className="mx-5 mt-5 rounded-3xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--hairline)' }}>
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <Sk style={{ width: 90, height: 12 }} />
          <Sk style={{ width: 130, height: 28 }} />
        </div>
        <div className="flex flex-col gap-2 items-end">
          <Sk style={{ width: 50, height: 12 }} />
          <Sk style={{ width: 70, height: 20 }} />
        </div>
      </div>
      <div className="h-2 rounded-full mt-4" style={{ background: 'var(--track)' }} />
      <Sk style={{ width: 200, height: 12, marginTop: 10 }} />
    </div>
  )
}
