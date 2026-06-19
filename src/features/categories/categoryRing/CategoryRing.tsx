import { CURRENCY } from '@/lib/constants'
import { fmt } from '@/lib/format'
import { getCategoryContext, getCategorySummary } from '../data'

export default async function CategoryRing({ id }: { id: string }) {
  const [{ category }, { available, pct, pctLeft }] = await Promise.all([
    getCategoryContext(id),
    getCategorySummary(id),
  ])

  const conicGradient = `conic-gradient(${category.color} 0% ${pct}%, #E7E2DA ${pct}% 100%)`

  return (
    <div className="flex justify-center pt-6 pb-2">
      <div
        className="flex items-center justify-center rounded-full"
        style={{ width: 172, height: 172, background: conicGradient, boxShadow: `0 14px 26px -14px ${category.color}80` }}
      >
        <div
          className="rounded-full flex flex-col items-center justify-center"
          style={{ width: 134, height: 134, background: '#F6F3EE' }}
        >
          <span className="text-[12px] font-bold" style={{ color: '#9A9FA8' }}>Available</span>
          <span className="text-[28px] font-extrabold tracking-tight mt-0.5" style={{ color: '#20242E' }}>{fmt(Math.max(0, available))}</span>
          <span className="text-[11px] font-bold mt-0.5" style={{ color: category.color }}>{CURRENCY} · {Math.round(pctLeft)}% left</span>
        </div>
      </div>
    </div>
  )
}
