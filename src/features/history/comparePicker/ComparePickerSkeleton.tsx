import { Sk } from '@/features/common/Skeleton'

export default function ComparePickerSkeleton() {
  return (
    <div className="flex items-center gap-2 px-5 mt-5">
      <Sk className="flex-1 rounded-full" style={{ height: 44 }} />
      <Sk className="rounded-full" style={{ width: 44, height: 44 }} />
      <Sk className="flex-1 rounded-full" style={{ height: 44 }} />
    </div>
  )
}
