import { fmt } from '@/lib/format'
import { getCategoryContext, getCategorySummary } from '../data'

export default async function CategoryStats({ id }: { id: string }) {
  const [{ category }, { allocated, totalConsumed, available }] = await Promise.all([
    getCategoryContext(id),
    getCategorySummary(id),
  ])

  const stats = [
    { label: 'Budget', value: fmt(allocated), color: '#20242E' },
    { label: 'Consumed', value: fmt(totalConsumed), color: category.color },
    { label: 'Available', value: fmt(Math.max(0, available)), color: '#20242E' },
  ]

  return (
    <div className="mx-5 mt-3.5 flex gap-2.5">
      {stats.map(s => (
        <div key={s.label} className="flex-1 rounded-2xl p-3.5 text-center" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
          <div className="text-[11px] font-bold" style={{ color: '#9A9FA8' }}>{s.label}</div>
          <div className="text-[17px] font-extrabold mt-0.5" style={{ color: s.color }}>{s.value}</div>
        </div>
      ))}
    </div>
  )
}
