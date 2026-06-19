import { Sk } from '@/features/common/Skeleton'

export default function CategoryHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between px-5 pt-12 pb-0">
      <Sk className="rounded-[13px]" style={{ width: 40, height: 40 }} />
      <div className="flex items-center gap-2.5">
        <Sk className="rounded-[9px]" style={{ width: 30, height: 30 }} />
        <Sk style={{ width: 80, height: 17 }} />
      </div>
      <Sk className="rounded-[13px]" style={{ width: 40, height: 40 }} />
    </div>
  )
}
