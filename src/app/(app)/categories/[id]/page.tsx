import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CategoryIcon from '@/components/CategoryIcon'
import MemberAvatar from '@/components/MemberAvatar'
import { MONTHS, CURRENCY } from '@/lib/constants'
import type { Category, Profile } from '@/types'

export default async function CategoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const [catRes, gmRes] = await Promise.all([
    supabase.from('categories').select('*').eq('id', id).single(),
    supabase.from('group_members').select('group_id, groups(id)').eq('user_id', user.id).limit(1).single(),
  ])

  const cat = catRes.data as Category | null
  if (!cat) notFound()

  const group = gmRes.data?.groups as unknown as { id: string } | null
  if (!group) redirect('/dashboard')

  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`

  const [budgetRes, expensesRes] = await Promise.all([
    supabase.from('budgets').select('id, total_amount').eq('group_id', group.id).eq('month', month).eq('year', year).single(),
    supabase.from('expenses').select('*, profiles(display_name, avatar_color)').eq('group_id', group.id).eq('category_id', id).gte('expense_date', monthStart).order('expense_date', { ascending: false }),
  ])

  type ExpenseRow = { id: string; amount: number; note: string | null; expense_date: string; profiles: Profile | null }
  const expenses = (expensesRes.data as unknown as ExpenseRow[]) ?? []
  const totalConsumed = expenses.reduce((s, e) => s + e.amount, 0)

  let allocated = 0
  if (budgetRes.data) {
    const bRow = budgetRes.data as unknown as { id: string }
    const { data: bc } = await supabase.from('budget_categories').select('allocated_amount').eq('budget_id', bRow.id).eq('category_id', id).single()
    allocated = (bc as unknown as { allocated_amount: number } | null)?.allocated_amount ?? 0
  }

  const available = allocated - totalConsumed
  const pct = allocated > 0 ? Math.min(100, (totalConsumed / allocated) * 100) : 0
  const pctLeft = 100 - pct

  function fmt(n: number) {
    return n.toLocaleString('en-AE', { maximumFractionDigits: 0 })
  }

  const conicGradient = `conic-gradient(${cat.color} 0% ${pct}%, #E7E2DA ${pct}% 100%)`

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#F6F3EE' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-0">
        <Link href="/dashboard" className="w-10 h-10 rounded-[13px] flex items-center justify-center" style={{ background: '#fff', border: '1px solid #EAE5DD', color: '#3A3F49' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </Link>
        <div className="flex items-center gap-2.5">
          <CategoryIcon icon={cat.icon} color={cat.color} bg_color={cat.bg_color} size={30} iconSize={16} radius={9} />
          <span className="text-[17px] font-extrabold" style={{ color: '#20242E' }}>{cat.name}</span>
        </div>
        <Link href="/budget/set" className="w-10 h-10 rounded-[13px] flex items-center justify-center" style={{ background: '#fff', border: '1px solid #EAE5DD', color: '#3A3F49' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
        </Link>
      </div>

      {/* Ring chart */}
      <div className="flex justify-center pt-6 pb-2">
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: 172, height: 172, background: conicGradient, boxShadow: `0 14px 26px -14px ${cat.color}80` }}
        >
          <div
            className="rounded-full flex flex-col items-center justify-center"
            style={{ width: 134, height: 134, background: '#F6F3EE' }}
          >
            <span className="text-[12px] font-bold" style={{ color: '#9A9FA8' }}>Available</span>
            <span className="text-[28px] font-extrabold tracking-tight mt-0.5" style={{ color: '#20242E' }}>{fmt(Math.max(0, available))}</span>
            <span className="text-[11px] font-bold mt-0.5" style={{ color: cat.color }}>{CURRENCY} · {Math.round(pctLeft)}% left</span>
          </div>
        </div>
      </div>

      {/* Stat row */}
      <div className="mx-5 mt-3.5 flex gap-2.5">
        {[
          { label: 'Budget', value: fmt(allocated), color: '#20242E' },
          { label: 'Consumed', value: fmt(totalConsumed), color: cat.color },
          { label: 'Available', value: fmt(Math.max(0, available)), color: '#20242E' },
        ].map(s => (
          <div key={s.label} className="flex-1 rounded-2xl p-3.5 text-center" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
            <div className="text-[11px] font-bold" style={{ color: '#9A9FA8' }}>{s.label}</div>
            <div className="text-[17px] font-extrabold mt-0.5" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Transactions */}
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
            const profile = exp.profiles as { display_name: string; avatar_color: string } | null
            const isLast = i === expenses.length - 1
            return (
              <div key={exp.id} className="flex items-center gap-3 py-3" style={{ borderBottom: isLast ? 'none' : '1px solid #F4F0E9' }}>
                <MemberAvatar name={profile?.display_name ?? '?'} color={profile?.avatar_color ?? '#3B6FF6'} size={36} fontSize={13} />
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-bold truncate" style={{ color: '#2A2E37' }}>{exp.note ?? cat.name}</div>
                  <div className="text-[11px] font-semibold mt-0.5" style={{ color: '#9A9FA8' }}>
                    {profile?.display_name?.split(' ')[0]} · {new Date(exp.expense_date + 'T00:00:00').toLocaleDateString('en-AE', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <span className="text-[14px] font-extrabold" style={{ color: '#20242E' }}>−{fmt(exp.amount)}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
