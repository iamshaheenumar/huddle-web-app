import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getActiveGroup } from '@/lib/group'
import MemberAvatar from '@/components/MemberAvatar'
import { CURRENCY, MONTHS } from '@/lib/constants'

export default async function MembersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`

  const group = await getActiveGroup(supabase, user.id)

  type MemberRow = { user_id: string; role: string; profiles: { display_name: string; avatar_color: string } | null }
  type ExpenseRow = { paid_by: string; amount: number }

  const [membersRes, budgetRes, expensesRes] = await Promise.all([
    supabase.from('group_members').select('user_id, role, profiles(display_name, avatar_color)').eq('group_id', group.id),
    supabase.from('budgets').select('total_amount').eq('group_id', group.id).eq('month', month).eq('year', year).single(),
    supabase.from('expenses').select('paid_by, amount').eq('group_id', group.id).gte('expense_date', monthStart),
  ])

  const rawMembers = (membersRes.data as unknown as MemberRow[]) ?? []
  const expenses = (expensesRes.data as unknown as ExpenseRow[]) ?? []
  const totalBudget = (budgetRes.data as unknown as { total_amount: number } | null)?.total_amount ?? 0
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0)
  const pctUsed = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0

  const members = rawMembers.map(m => {
    const profile = m.profiles
    const spent = expenses.filter(e => e.paid_by === m.user_id).reduce((s, e) => s + e.amount, 0)
    const txCount = expenses.filter(e => e.paid_by === m.user_id).length
    return { user_id: m.user_id, role: m.role, profile, spent, txCount }
  }).sort((a, b) => b.spent - a.spent)

  const maxSpent = members[0]?.spent ?? 1

  const MEMBER_COLORS_PALETTE = ['#3B6FF6', '#2E9E6B', '#E5683E', '#8A5CF0', '#1FA0A6']

  function fmt(n: number) {
    return n.toLocaleString('en-AE', { maximumFractionDigits: 0 })
  }

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#F6F3EE' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-0">
        <div>
          <div className="text-[13px] font-semibold" style={{ color: '#9A9FA8' }}>Group</div>
          <div className="flex items-center gap-2 mt-0.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#3B6FF6"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            <span className="text-[20px] font-extrabold" style={{ color: '#20242E' }}>{group.name}</span>
            <span className="text-[12px] font-bold" style={{ color: '#9A9FA8' }}>· {members.length} members</span>
          </div>
        </div>
        <Link href="/members/invite" className="flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-bold" style={{ background: '#fff', border: '1px solid #EAE5DD', color: '#3B6FF6' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
          Invite
        </Link>
      </div>

      {/* Group total card */}
      <div className="mx-5 mt-5 rounded-3xl p-5 text-white" style={{ background: '#20242E' }}>
        <div className="flex justify-between items-start">
          <div>
            <div className="text-[12px] font-semibold opacity-70">Consumed</div>
            <div className="text-[28px] font-extrabold tracking-tight mt-0.5">{CURRENCY} {fmt(totalSpent)}</div>
          </div>
          <div className="text-right">
            <div className="text-[12px] font-semibold opacity-70">Total budget</div>
            <div className="text-[18px] font-extrabold mt-0.5">{fmt(totalBudget)}</div>
          </div>
        </div>
        <div className="h-2 rounded-full mt-4 overflow-hidden flex" style={{ background: 'rgba(255,255,255,.18)' }}>
          {members.map((m, i) => {
            const w = totalSpent > 0 ? (m.spent / totalSpent) * pctUsed : 0
            return <div key={m.user_id} style={{ width: `${w}%`, background: m.profile?.avatar_color ?? MEMBER_COLORS_PALETTE[i % MEMBER_COLORS_PALETTE.length] }} />
          })}
        </div>
        <div className="text-[12px] font-semibold opacity-70 mt-2.5">
          {pctUsed}% of budget used across {members.length} members in {MONTHS[month - 1]}
        </div>
      </div>

      {/* Member list */}
      <div className="px-5 pt-5 pb-3">
        <span className="text-base font-extrabold" style={{ color: '#20242E' }}>Spending by member</span>
      </div>
      <div className="mx-5 flex flex-col gap-2.5">
        {members.map((m, i) => {
          const barPct = maxSpent > 0 ? (m.spent / maxSpent) * 100 : 0
          const color = m.profile?.avatar_color ?? MEMBER_COLORS_PALETTE[i % MEMBER_COLORS_PALETTE.length]
          return (
            <div key={m.user_id} className="rounded-[18px] p-3.5" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
              <div className="flex items-center gap-3">
                <MemberAvatar name={m.profile?.display_name ?? '?'} color={color} size={40} fontSize={15} />
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-extrabold flex items-center gap-2" style={{ color: '#2A2E37' }}>
                    {m.profile?.display_name ?? 'Unknown'}
                    {m.role === 'owner' && (
                      <span className="text-[10px] font-bold rounded-[5px] px-1.5 py-0.5" style={{ color: '#3B6FF6', background: '#E9F0FE' }}>Owner</span>
                    )}
                  </div>
                  <div className="text-[11px] font-semibold mt-0.5" style={{ color: '#9A9FA8' }}>{m.txCount} transaction{m.txCount !== 1 ? 's' : ''}</div>
                </div>
                <span className="text-[16px] font-extrabold" style={{ color: '#20242E' }}>{fmt(m.spent)}</span>
              </div>
              <div className="h-1.5 rounded-full mt-3 overflow-hidden" style={{ background: '#EFEBE3' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${barPct}%`, background: color }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
