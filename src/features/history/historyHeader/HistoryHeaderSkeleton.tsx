import { Sk } from '@/features/common/Skeleton'

export default function HistoryHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between px-5 pt-12 pb-1">
      <div className="flex flex-col gap-1.5">
        <Sk style={{ width: 90, height: 13 }} />
        <Sk style={{ width: 100, height: 22 }} />
      </div>
      <Sk style={{ width: 44, height: 44, borderRadius: 14 }} />
    </div>
  )
}
