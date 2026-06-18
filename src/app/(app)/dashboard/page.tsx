import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getActiveGroup, listUserGroups } from '@/lib/group'
import { MONTHS, CURRENCY } from '@/lib/constants'
import CategoryIcon from '@/components/CategoryIcon'
import MemberAvatar from '@/components/MemberAvatar'
import GroupSwitcher from '@/components/GroupSwitcher'
import Greeting from '@/components/Greeting'
import type { Profile } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const [profileRes, group, groups] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    getActiveGroup(supabase, user.id),
    listUserGroups(supabase, user.id),
  ])

  const profile = profileRes.data as Profile | null

  let budget = null
  let budgetCategories: Array<{ allocated_amount: number; consumed: number; category: { id: string; name: string; icon: string; color: string; bg_color: string } }> = []
  let members: Array<{ user_id: string; profile: { display_name: string; avatar_color: string } | null; spent: number }> = []
  let recentExpenses: Array<{ id: string; amount: number; note: string | null; expense_date: string; profile: { display_name: string; avatar_color: string } | null; category: { name: string } | null }> = []
  let totalSpent = 0

  if (group) {
    const [budgetRes, expensesRes, membersRes] = await Promise.all([
      supabase.from('budgets').select('*').eq('group_id', group.id).eq('month', month).eq('year', year).single(),
      supabase.from('expenses').select('*, profiles(display_name, avatar_color), categories(name, icon, color, bg_color)').eq('group_id', group.id).gte('expense_date', `${year}-${String(month).padStart(2, '0')}-01`).order('created_at', { ascending: false }),
      supabase.from('group_members').select('user_id, role, profiles(display_name, avatar_color)').eq('group_id', group.id),
    ])

    type BudgetRow = { id: string; total_amount: number }
    type ExpRow = { id: string; amount: number; note: string | null; expense_date: string; category_id: string; paid_by: string; profiles: { display_name: string; avatar_color: string } | null; categories: { name: string; icon: string; color: string; bg_color: string; id: string } | null }
    type MemberRow = { user_id: string; profiles: { display_name: string; avatar_color: string } | null }
    type BCRow = { allocated_amount: number; categories: { id: string; name: string; icon: string; color: string; bg_color: string } | null }

    budget = budgetRes.data as unknown as BudgetRow | null

    const expenses = (expensesRes.data as unknown as ExpRow[]) ?? []
    recentExpenses = expenses.slice(0, 4).map(e => ({
      id: e.id,
      amount: e.amount,
      note: e.note,
      expense_date: e.expense_date,
      profile: e.profiles,
      category: e.categories,
    }))

    totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)

    if (budget) {
      const { data: bcData } = await supabase.from('budget_categories').select('*, categories(id, name, icon, color, bg_color)').eq('budget_id', (budget as BudgetRow).id)
      budgetCategories = ((bcData as unknown as BCRow[]) ?? []).map(bc => {
        const cat = bc.categories!
        const consumed = expenses.filter(e => e.category_id === cat?.id).reduce((s, e) => s + e.amount, 0)
        return { allocated_amount: bc.allocated_amount, consumed, category: cat }
      })
    }

    const rawMembers = (membersRes.data as unknown as MemberRow[]) ?? []
    members = rawMembers.map(m => ({
      user_id: m.user_id,
      profile: m.profiles,
      spent: expenses.filter(e => e.paid_by === m.user_id).reduce((s, e) => s + e.amount, 0),
    }))
  }

  const totalBudget = (budget as { total_amount: number } | null)?.total_amount ?? 0
  const remaining = totalBudget - totalSpent
  const pctUsed = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'
  const displayName = profile?.display_name ?? 'there'

  function fmt(n: number) {
    return n.toLocaleString('en-AE', { maximumFractionDigits: 0 })
  }

  return (
    <div className="flex flex-col">
      {/* Greeting + Avatar */}
      <div className="flex items-center justify-between px-5 pt-12">
        <div>
          <Greeting name={displayName} initial={greeting} />
          <GroupSwitcher currentGroup={group} groups={groups} />
        </div>
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center font-extrabold text-base text-white"
          style={{ background: profile?.avatar_color ?? '#3B6FF6', boxShadow: '0 6px 14px -6px rgba(59,111,246,.7)' }}
        >
          {displayName.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Hero Budget Card */}
      <div className="mx-5 mt-4 rounded-3xl p-5 text-white" style={{ background: 'linear-gradient(152deg,#4D79F8 0%,#3461E8 100%)', boxShadow: '0 20px 34px -16px rgba(52,97,232,.6)' }}>
        <div className="flex justify-between items-center">
          <span className="text-[13px] font-semibold opacity-90">{MONTHS[month - 1]} budget</span>
          <span className="text-[11px] font-bold rounded-full px-3 py-1" style={{ background: 'rgba(255,255,255,.2)' }}>{pctUsed}% used</span>
        </div>
        <div className="text-[36px] font-extrabold mt-3 tracking-tight leading-none">
          {CURRENCY} {fmt(remaining)}
        </div>
        <div className="text-[13px] opacity-85 mt-0.5">remaining of {CURRENCY} {fmt(totalBudget)}</div>
        <div className="h-2.5 rounded-full mt-4 overflow-hidden" style={{ background: 'rgba(255,255,255,.26)' }}>
          <div className="h-full rounded-full" style={{ width: `${pctUsed}%`, background: '#fff' }} />
        </div>
        <div className="flex justify-between mt-3 text-[12px] font-semibold opacity-90">
          <span>Spent {CURRENCY} {fmt(totalSpent)}</span>
          <span>Left {CURRENCY} {fmt(remaining)}</span>
        </div>
      </div>

      {/* Members */}
      {members.length > 0 && (
        <>
          <div className="flex items-center justify-between px-5 pt-5">
            <span className="text-base font-extrabold" style={{ color: '#20242E' }}>Members</span>
            <Link href="/members" className="text-[12px] font-bold" style={{ color: '#3B6FF6' }}>See all</Link>
          </div>
          <div className="flex gap-2.5 px-5 mt-3">
            {members.slice(0, 4).map(m => (
              <div key={m.user_id} className="flex-1 rounded-[18px] p-3 text-center" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
                <MemberAvatar name={m.profile?.display_name ?? '?'} color={m.profile?.avatar_color ?? '#3B6FF6'} size={38} />
                <div className="text-[12px] font-bold mt-2" style={{ color: '#3A3F49' }}>{m.profile?.display_name?.split(' ')[0]}</div>
                <div className="text-[13px] font-extrabold mt-0.5" style={{ color: '#20242E' }}>{fmt(m.spent)}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Categories */}
      {budgetCategories.length > 0 && (
        <>
          <div className="flex items-center justify-between px-5 pt-5">
            <span className="text-base font-extrabold" style={{ color: '#20242E' }}>Categories</span>
            <Link href="/budget/set" className="text-[12px] font-bold" style={{ color: '#3B6FF6' }}>Edit budget</Link>
          </div>
          <div className="mx-5 mt-3 rounded-[22px] py-1.5 px-4" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
            {budgetCategories.map((bc, i) => {
              const pct = bc.allocated_amount > 0 ? Math.min(100, Math.round((bc.consumed / bc.allocated_amount) * 100)) : 0
              const isLast = i === budgetCategories.length - 1
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
      )}

      {/* No budget set */}
      {!budget && group && (
        <div className="mx-5 mt-6 rounded-3xl p-6 text-center" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
          <p className="text-[15px] font-bold mb-3" style={{ color: '#20242E' }}>No budget set for {MONTHS[month - 1]}</p>
          <Link href="/budget/set" className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold text-white" style={{ background: '#3B6FF6' }}>
            Set budget
          </Link>
        </div>
      )}

      {/* Recent activity */}
      {recentExpenses.length > 0 && (
        <>
          <div className="px-5 pt-5">
            <span className="text-base font-extrabold" style={{ color: '#20242E' }}>Recent activity</span>
          </div>
          <div className="mx-5 mt-3 flex flex-col gap-2.5 pb-4">
            {recentExpenses.map(exp => (
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
      )}
    </div>
  )
}
