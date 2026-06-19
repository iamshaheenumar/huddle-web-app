import Link from 'next/link'
import CategoryIcon from '@/features/common/CategoryIcon'
import { fmt } from '@/lib/format'
import { getBudgetCategories } from '../data'

export default async function CategoriesSection() {
  const categories = await getBudgetCategories()
  if (categories.length === 0) return null

  return (
    <>
      <div className="flex items-center justify-between px-5 pt-5">
        <span className="text-base font-extrabold" style={{ color: '#20242E' }}>Categories</span>
        <Link href="/budget/set" className="text-[12px] font-bold" style={{ color: '#3B6FF6' }}>Edit budget</Link>
      </div>
      <div className="mx-5 mt-3 rounded-[22px] py-1.5 px-4" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
        {categories.map((bc, i) => {
          const pct = bc.allocated_amount > 0 ? Math.min(100, Math.round((bc.consumed / bc.allocated_amount) * 100)) : 0
          const isLast = i === categories.length - 1
          const fullyUsed = pct >= 100
          return (
            <Link href={`/categories/${bc.category?.id}`} key={bc.category?.id ?? i}>
              <div className="flex items-center gap-3 py-3" style={{ borderBottom: isLast ? 'none' : '1px solid #F4F0E9' }}>
                {bc.category && <CategoryIcon icon={bc.category.icon} color={bc.category.color} bg_color={bc.category.bg_color} />}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-[14px] font-bold" style={{ color: '#2A2E37' }}>{bc.category?.name}</span>
                    {fullyUsed
                      ? <span className="text-[12px] font-extrabold rounded-md px-2 py-0.5" style={{ color: '#E0563E', background: '#FBE7E1' }}>Fully used</span>
                      : <span className="text-[13px] font-bold tabular-nums" style={{ color: '#20242E' }}>{fmt(bc.consumed)} <span style={{ color: '#B6BAC1', fontWeight: 600 }}>/ {fmt(bc.allocated_amount)}</span></span>
                    }
                  </div>
                  <div className="h-1.5 rounded-full mt-2 overflow-hidden" style={{ background: '#EFEBE3' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: bc.category?.color ?? '#3B6FF6' }} />
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}
