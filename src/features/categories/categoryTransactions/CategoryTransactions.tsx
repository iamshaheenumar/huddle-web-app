import Link from 'next/link'
import MemberAvatar from '@/features/common/MemberAvatar'
import { MONTHS } from '@/lib/constants'
import { fmt } from '@/lib/format'
import { getCategoryContext, getCategoryExpenses } from '../data'

export default async function CategoryTransactions({ id }: { id: string }) {
  const [{ category, month }, expenses] = await Promise.all([
    getCategoryContext(id),
    getCategoryExpenses(id),
  ])

  return (
    <>
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <span className="text-base font-extrabold" style={{ color: '#20242E' }}>Transactions</span>
        <span className="text-[12px] font-bold" style={{ color: '#9A9FA8' }}>{expenses.length} this month</span>
      </div>

      {expenses.length === 0 && (
        <div className="mx-5 rounded-3xl p-6 text-center" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
          <p className="text-sm font-semibold" style={{ color: '#9A9FA8' }}>No transactions in {MONTHS[month - 1]} yet</p>
          <Link href="/expense/add" className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold text-white mt-3" style={{ background: '#3B6FF6' }}>
            Add first expense
          </Link>
        </div>
      )}

      {expenses.length > 0 && (
        <div className="mx-5 rounded-[20px] py-1 px-4" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
          {expenses.map((exp, i) => {
            const isLast = i === expenses.length - 1
            return (
              <div key={exp.id} className="flex items-center gap-3 py-3" style={{ borderBottom: isLast ? 'none' : '1px solid #F4F0E9' }}>
                <MemberAvatar name={exp.profile?.display_name ?? '?'} color={exp.profile?.avatar_color ?? '#3B6FF6'} size={36} fontSize={13} />
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-bold truncate" style={{ color: '#2A2E37' }}>{exp.note ?? category.name}</div>
                  <div className="text-[11px] font-semibold mt-0.5" style={{ color: '#9A9FA8' }}>
                    {exp.profile?.display_name?.split(' ')[0]} · {new Date(exp.expense_date + 'T00:00:00').toLocaleDateString('en-AE', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <span className="text-[14px] font-extrabold" style={{ color: '#20242E' }}>−{fmt(exp.amount)}</span>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
