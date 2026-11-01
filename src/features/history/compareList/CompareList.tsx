'use client'

import CategoryIcon from '@/features/common/CategoryIcon'
import MemberAvatar from '@/features/common/MemberAvatar'
import CategoryBreakdownSkeleton from '../categoryBreakdown/CategoryBreakdownSkeleton'
import { fmt } from '@/lib/format'
import { useMonthComparison } from '../queries'
import type { CompareRow } from '../types'

type Row = CompareRow & { id: string; name: string; color: string; icon: React.ReactNode }

// More spend is shown as a rise in red, less as a fall in green.
function DeltaChip({ delta }: { delta: number }) {
  if (delta === 0) {
    return <span className="text-label font-bold rounded-full px-2.5 py-1 shrink-0" style={{ background: 'var(--subtle)', color: 'var(--muted)' }}>Same</span>
  }
  const up = delta > 0
  return (
    <span
      className="text-label font-bold rounded-full px-2.5 py-1 shrink-0 tabular-nums"
      style={up ? { background: 'var(--danger-soft)', color: 'var(--danger-text)' } : { background: 'var(--income-soft)', color: 'var(--income-text)' }}
    >
      {up ? '+' : '−'}{fmt(Math.abs(delta))}
    </span>
  )
}

function Rows({ title, rows, aShort, bShort }: { title: string; rows: Row[]; aShort: string; bShort: string }) {
  // One scale across the section, so bar lengths compare between rows too.
  const max = Math.max(...rows.map(r => Math.max(r.a, r.b)))
  const width = (n: number) => `${Math.max(n > 0 ? 2 : 0, (n / max) * 100)}%`

  const bar = (label: string, value: number, color: string) => (
    <div className="flex items-center gap-2">
      <span className="text-label font-bold w-12 shrink-0" style={{ color: 'var(--muted)' }}>{label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--track)' }}>
        <div className="h-full rounded-full" style={{ width: width(value), background: color }} />
      </div>
      <span className="text-meta font-bold tabular-nums w-16 text-right shrink-0" style={{ color: 'var(--ink)' }}>{fmt(value)}</span>
    </div>
  )

  return (
    <>
      <div className="px-5 pt-6">
        <h2 className="text-row font-extrabold" style={{ color: 'var(--ink)' }}>{title}</h2>
      </div>
      <div className="flex flex-col gap-2.5 px-5 mt-3">
        {rows.map(r => (
          <div key={r.id} className="rounded-[20px] p-4" style={{ background: 'var(--card)', border: '1px solid var(--hairline)' }}>
            <div className="flex items-center gap-3">
              {r.icon}
              <span className="flex-1 min-w-0 text-body font-bold truncate" style={{ color: 'var(--ink)' }}>{r.name}</span>
              <DeltaChip delta={r.delta} />
            </div>
            <div className="flex flex-col gap-1.5 mt-3">
              {bar(aShort, r.a, r.color)}
              {bar(bShort, r.b, 'var(--icon-subtle)')}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

// Category and member spend for both months, biggest change first.
export default function CompareList({ a, b }: { a?: string; b?: string }) {
  const c = useMonthComparison(a, b)
  if (!c) return <CategoryBreakdownSkeleton />
  if (c.a.spent === 0 && c.b.spent === 0) {
    return (
      <div className="mx-5 mt-4 rounded-[22px] py-[22px] text-center text-body font-medium" style={{ background: 'var(--card)', border: '1px solid var(--hairline)', color: 'var(--muted)' }}>
        No spending in either month
      </div>
    )
  }

  const categories: Row[] = c.categories.map(x => ({
    ...x,
    id: x.category.id,
    name: x.category.name,
    color: x.category.color,
    icon: <CategoryIcon icon={x.category.icon} color={x.category.color} bg_color={x.category.bg_color} size={34} iconSize={17} radius={11} />,
  }))
  const members: Row[] = c.members.map(m => {
    const name = m.profile?.display_name ?? 'Unknown'
    const color = m.profile?.avatar_color ?? '#3B6FF6'
    return { ...m, id: m.user_id, name, color, icon: <MemberAvatar name={name} color={color} size={34} fontSize={13} /> }
  })

  return (
    <>
      {categories.length > 0 && <Rows title="By category" rows={categories} aShort={c.a.short} bShort={c.b.short} />}
      {members.length > 1 && <Rows title="By member" rows={members} aShort={c.a.short} bShort={c.b.short} />}
    </>
  )
}
