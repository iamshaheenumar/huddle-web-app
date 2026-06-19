import { Sk } from '@/features/common/Skeleton'

export default function DashboardHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between px-5 pt-12">
      <div className="flex flex-col gap-2">
        <Sk style={{ width: 130, height: 13 }} />
        <Sk style={{ width: 100, height: 20 }} />
      </div>
      <Sk className="rounded-full" style={{ width: 44, height: 44 }} />
    </div>
  )
}
