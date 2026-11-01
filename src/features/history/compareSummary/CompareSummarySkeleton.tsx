import { Sk } from '@/features/common/Skeleton'

export default function CompareSummarySkeleton() {
  return (
    <div className="mx-5 mt-4 rounded-3xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--hairline)' }}>
      <div className="flex justify-between">
        <div>
          <Sk style={{ width: 80, height: 12 }} />
          <Sk style={{ width: 100, height: 24, marginTop: 8 }} />
        </div>
        <div className="flex flex-col items-end">
          <Sk style={{ width: 80, height: 12 }} />
          <Sk style={{ width: 100, height: 24, marginTop: 8 }} />
        </div>
      </div>
      <Sk className="rounded-full" style={{ width: '100%', height: 8, marginTop: 18 }} />
      <Sk className="rounded-full" style={{ width: '70%', height: 8, marginTop: 6 }} />
      <Sk style={{ width: '100%', height: 36, marginTop: 16, borderRadius: 16 }} />
    </div>
  )
}
