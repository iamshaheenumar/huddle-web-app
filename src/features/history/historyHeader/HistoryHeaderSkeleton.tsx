import { Sk } from '@/features/common/Skeleton'

export default function HistoryHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between px-5 pt-12 pb-1">
      <Sk style={{ width: 40, height: 40, borderRadius: 13 }} />
      <div className="flex flex-col items-center gap-1.5">
        <Sk style={{ width: 72, height: 12 }} />
        <Sk style={{ width: 128, height: 17 }} />
      </div>
      <Sk style={{ width: 40, height: 40, borderRadius: 13 }} />
    </div>
  )
}
