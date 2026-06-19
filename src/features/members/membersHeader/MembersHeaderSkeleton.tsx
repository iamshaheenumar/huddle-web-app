import { Sk } from '@/features/common/Skeleton'

export default function MembersHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between px-5 pt-12 pb-0">
      <div className="flex flex-col gap-2">
        <Sk style={{ width: 40, height: 13 }} />
        <Sk style={{ width: 130, height: 22 }} />
      </div>
      <Sk className="rounded-full" style={{ width: 72, height: 34 }} />
    </div>
  )
}
