import { Sk } from '@/features/common/Skeleton'

export default function CategoryRingSkeleton() {
  return (
    <div className="flex justify-center pt-6 pb-2">
      <Sk className="rounded-full" style={{ width: 172, height: 172 }} />
    </div>
  )
}
