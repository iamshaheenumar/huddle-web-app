import { Sk } from '@/features/common/Skeleton'

export default function GroupTotalCardSkeleton() {
  return (
    <div className="mx-5 mt-5 rounded-3xl p-5" style={{ background: '#20242E' }}>
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <Sk style={{ width: 60, height: 12, background: 'rgba(255,255,255,.2)' }} />
          <Sk style={{ width: 110, height: 28, background: 'rgba(255,255,255,.25)' }} />
        </div>
        <div className="flex flex-col gap-2 items-end">
          <Sk style={{ width: 70, height: 12, background: 'rgba(255,255,255,.2)' }} />
          <Sk style={{ width: 80, height: 20, background: 'rgba(255,255,255,.25)' }} />
        </div>
      </div>
      <div className="h-2 rounded-full mt-4" style={{ background: 'rgba(255,255,255,.18)' }} />
      <Sk style={{ width: 180, height: 12, marginTop: 10, background: 'rgba(255,255,255,.15)' }} />
    </div>
  )
}
