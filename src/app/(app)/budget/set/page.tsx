'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CaretLeft, Plus, Check, CheckCircle } from '@phosphor-icons/react'
import CategoryIcon from '@/components/CategoryIcon'
import { createClient } from '@/lib/supabase/client'
import { getActiveGroup } from '@/lib/group'
import { CATEGORIES, MONTHS, CURRENCY } from '@/lib/constants'
import type { Category } from '@/types'

const STEP = 100

export default function SetBudgetPage() {
  const router = useRouter()

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const [groupId, setGroupId] = useState<string | null>(null)
  const [groupName, setGroupName] = useState('Home')
  const [totalBudget, setTotalBudget] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])
  const [allocations, setAllocations] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editingTotal, setEditingTotal] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const group = await getActiveGroup(supabase, user.id)
      setGroupId(group.id)
      setGroupName(group.name)

      const { data: catsData } = await supabase.from('categories').select('*').eq('is_default', true).order('name')
      let cats = catsData as Category[] | null
      if (!cats || cats.length === 0) {
        const inserts = CATEGORIES.map(c => ({ name: c.name, icon: c.icon, color: c.color, bg_color: c.bg_color, is_default: true }))
        const { data: newCats } = await supabase.from('categories').insert(inserts).select()
        cats = newCats as Category[] | null
      }
      setCategories(cats ?? [])

      if (group) {
        const { data: budget } = await supabase.from('budgets').select('id, total_amount').eq('group_id', group.id).eq('month', month).eq('year', year).single()
        const b = budget as { id: string; total_amount: number } | null
        if (b) {
          setTotalBudget(b.total_amount)
          const { data: bcs } = await supabase.from('budget_categories').select('category_id, allocated_amount').eq('budget_id', b.id)
          const alloc: Record<string, number> = {}
          ;(bcs as { category_id: string; allocated_amount: number }[] | null)?.forEach(bc => { alloc[bc.category_id] = bc.allocated_amount })
          setAllocations(alloc)
        } else {
          const defaultAlloc: Record<string, number> = {}
          cats?.forEach(c => { defaultAlloc[c.id] = 0 })
          setAllocations(defaultAlloc)
        }
      }
    }
    load()
  }, [])

  function setCategoryAmount(catId: string, newValue: number) {
    const clamped = Math.max(0, newValue)
    const old = allocations[catId] ?? 0
    const delta = clamped - old
    setAllocations(prev => ({ ...prev, [catId]: clamped }))
    if (delta !== 0) setTotalBudget(prev => Math.max(0, prev + delta))
  }

  function adjust(catId: string, delta: number) {
    setCategoryAmount(catId, (allocations[catId] ?? 0) + delta)
  }

  const totalAllocated = Object.values(allocations).reduce((s, v) => s + v, 0)
  const unallocated = totalBudget - totalAllocated
  const allocPct = totalBudget > 0 ? Math.min(100, (totalAllocated / totalBudget) * 100) : 0

  async function handleSave() {
    if (!groupId) return
    setLoading(true)
    const supabase = createClient()

    const { data: existingData } = await supabase.from('budgets').select('id').eq('group_id', groupId).eq('month', month).eq('year', year).single()
    const existing = existingData as { id: string } | null

    let budgetId: string
    if (existing) {
      await supabase.from('budgets').update({ total_amount: totalBudget } as never).eq('id', existing.id)
      budgetId = existing.id
      await supabase.from('budget_categories').delete().eq('budget_id', budgetId)
    } else {
      const { data: nbData } = await supabase.from('budgets').insert({ group_id: groupId, month, year, total_amount: totalBudget } as never).select().single()
      budgetId = (nbData as { id: string })!.id
    }

    const rows = Object.entries(allocations)
      .filter(([, v]) => v > 0)
      .map(([category_id, allocated_amount]) => ({ budget_id: budgetId, category_id, allocated_amount }))

    if (rows.length > 0) await supabase.from('budget_categories').insert(rows as never)

    setSaved(true)
    setLoading(false)
    setTimeout(() => router.push('/dashboard'), 1000)
  }

  function fmt(n: number) {
    return n.toLocaleString('en-AE', { maximumFractionDigits: 0 })
  }

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#F6F3EE' }}>
      {/* Header */}
      <div className="flex items-center gap-3.5 px-5 pt-12 pb-0">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-[13px] flex items-center justify-center" style={{ background: '#fff', border: '1px solid #EAE5DD', color: '#3A3F49' }}>
          <CaretLeft size={17} weight="bold" />
        </button>
        <div>
          <div className="text-[13px] font-semibold" style={{ color: '#9A9FA8' }}>{groupName} group</div>
          <div className="text-[19px] font-extrabold tracking-tight" style={{ color: '#20242E' }}>Set {MONTHS[month - 1]} budget</div>
        </div>
      </div>

      {/* Total card */}
      <div className="mx-5 mt-5 rounded-3xl p-5" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
        <div className="text-[13px] font-semibold" style={{ color: '#9A9FA8' }}>Total monthly budget</div>
        <div className="flex items-end gap-2 mt-1.5">
          <span className="text-[15px] font-bold pb-1.5" style={{ color: '#9A9FA8' }}>{CURRENCY}</span>
          {editingTotal ? (
            <input
              type="number"
              autoFocus
              value={totalBudget}
              onChange={e => setTotalBudget(Math.max(0, parseInt(e.target.value) || 0))}
              onBlur={() => setEditingTotal(false)}
              className="text-[38px] font-extrabold tracking-tight leading-none w-40 outline-none bg-transparent"
              style={{ color: '#20242E' }}
            />
          ) : (
            <span className="text-[38px] font-extrabold tracking-tight leading-none" style={{ color: '#20242E' }}>{fmt(totalBudget)}</span>
          )}
          <button onClick={() => setEditingTotal(true)} className="pb-1.5" style={{ color: '#3B6FF6' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
          </button>
        </div>
        <div className="h-2.5 rounded-full mt-4 overflow-hidden" style={{ background: '#EFEBE3' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${allocPct}%`, background: 'linear-gradient(90deg,#3B6FF6,#5A86F8)' }} />
        </div>
        <div className="flex justify-between mt-3">
          <span className="text-[12px] font-bold flex items-center gap-1" style={{ color: unallocated >= 0 ? '#2E9E6B' : '#E0563E' }}>
            <CheckCircle size={13} weight="fill" /> Allocated {fmt(totalAllocated)}
          </span>
          <span className="text-[12px] font-bold" style={{ color: unallocated >= 0 ? '#9A9FA8' : '#E0563E' }}>
            {unallocated >= 0 ? `Unallocated ${fmt(unallocated)}` : `Over by ${fmt(-unallocated)}`}
          </span>
        </div>
      </div>

      {/* Category steppers */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <span className="text-base font-extrabold" style={{ color: '#20242E' }}>Allocate by category</span>
        <span className="text-[12px] font-bold" style={{ color: '#3B6FF6' }}><Plus size={12} weight="bold" /> Add</span>
      </div>
      <div className="mx-5 flex flex-col gap-2.5">
        {categories.map(cat => (
          <div key={cat.id} className="flex items-center gap-3.5 rounded-[18px] py-3 px-3.5" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
            <CategoryIcon icon={cat.icon} color={cat.color} bg_color={cat.bg_color} size={40} iconSize={20} radius={12} />
            <span className="flex-1 text-[14px] font-bold" style={{ color: '#2A2E37' }}>{cat.name}</span>
            <div className="flex items-center gap-2.5">
              <button onClick={() => adjust(cat.id, -STEP)} className="w-7 h-7 rounded-[9px] flex items-center justify-center" style={{ background: '#F4F0E9', color: '#787D87' }}>
                <svg width="13" height="2" viewBox="0 0 13 2"><rect x="0" y="0" width="13" height="2" rx="1" fill="currentColor"/></svg>
              </button>
              <input
                type="number"
                inputMode="numeric"
                value={allocations[cat.id] ?? 0}
                onChange={e => setCategoryAmount(cat.id, parseInt(e.target.value) || 0)}
                onFocus={e => e.target.select()}
                className="text-[15px] font-extrabold text-center tabular-nums outline-none bg-transparent"
                style={{ color: '#20242E', width: 56 }}
              />
              <button onClick={() => adjust(cat.id, STEP)} className="w-7 h-7 rounded-[9px] flex items-center justify-center" style={{ background: '#E9F0FE', color: '#3B6FF6' }}>
                <Plus size={13} weight="bold" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Save button */}
      <div className="sticky bottom-20 px-5 mt-6" style={{ background: 'linear-gradient(180deg,rgba(246,243,238,0),#F6F3EE 38%)' }}>
        <button
          onClick={handleSave}
          disabled={loading || saved}
          className="w-full flex items-center justify-center gap-2.5 rounded-[17px] py-4 text-base font-extrabold text-white transition-opacity disabled:opacity-70"
          style={{ background: saved ? '#2E9E6B' : '#3B6FF6', boxShadow: '0 14px 24px -10px rgba(59,111,246,.7)' }}
        >
          {saved ? <><Check size={18} weight="bold" /> Saved!</> : loading ? 'Saving…' : <><Check size={18} weight="fill" /> Save {MONTHS[month - 1]} budget</>}
        </button>
      </div>
    </div>
  )
}
