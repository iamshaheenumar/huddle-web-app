import { HERO_FILL } from '@/features/common/heroCard'

function Bar({ w, h }: { w: number | string; h: number }) {
  return <div className="animate-pulse rounded-lg" style={{ width: w, height: h, background: 'rgba(255,255,255,.22)' }} />
}

export default function PeriodHeroCardSkeleton() {
  return (
    <div className="mx-5 mt-4 rounded-3xl p-5" style={{ background: HERO_FILL }}>
      <div className="flex items-center gap-2">
        <Bar w={120} h={18} />
        <Bar w={58} h={18} />
      </div>
      <div className="mt-5 flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <Bar w={80} h={12} />
          <Bar w={150} h={28} />
        </div>
        <div className="flex flex-col items-end gap-2">
          <Bar w={50} h={12} />
          <Bar w={64} h={18} />
        </div>
      </div>
      <div className="mt-4"><Bar w="100%" h={8} /></div>
      <div className="mt-3 flex justify-between">
        <Bar w={130} h={13} />
        <Bar w={60} h={13} />
      </div>
    </div>
  )
}
