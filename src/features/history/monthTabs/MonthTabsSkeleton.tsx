import { Sk } from '@/features/common/Skeleton'

export default function MonthTabsSkeleton() {
  return (
    <div className="flex gap-2 px-5 mt-4">
      {[0, 1, 2, 3].map(i => (
        <Sk key={i} style={{ width: 84, height: 36, borderRadius: 999 }} />
      ))}
    </div>
  )
}
