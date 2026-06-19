import MemberAvatar from '@/features/common/MemberAvatar'
import { fmt } from '@/lib/format'
import { getRecentExpenses } from '../data'

export default async function RecentActivitySection() {
  const expenses = await getRecentExpenses()
  if (expenses.length === 0) return null

  return (
    <>
      <div className="px-5 pt-5">
        <span className="text-base font-extrabold" style={{ color: '#20242E' }}>Recent activity</span>
      </div>
      <div className="mx-5 mt-3 flex flex-col gap-2.5 pb-4">
        {expenses.map(exp => (
          <div key={exp.id} className="flex items-center gap-3 rounded-2xl p-3" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
            <MemberAvatar name={exp.profile?.display_name ?? '?'} color={exp.profile?.avatar_color ?? '#3B6FF6'} size={34} fontSize={13} />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold truncate" style={{ color: '#2A2E37' }}>{exp.note ?? exp.category?.name ?? 'Expense'}</div>
              <div className="text-[11px] font-semibold mt-0.5" style={{ color: '#9A9FA8' }}>
                {exp.profile?.display_name?.split(' ')[0]} · {new Date(exp.expense_date).toLocaleDateString('en-AE', { month: 'short', day: 'numeric' })}
              </div>
            </div>
            <span className="text-[14px] font-extrabold" style={{ color: '#20242E' }}>−{fmt(exp.amount)}</span>
          </div>
        ))}
      </div>
    </>
  )
}
