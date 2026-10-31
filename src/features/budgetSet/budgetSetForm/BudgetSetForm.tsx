'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CaretLeft, Plus, Check, CheckCircle, PencilSimple, WarningCircle } from '@phosphor-icons/react'
import CategoryIcon from '@/features/common/CategoryIcon'
import AddCategorySheet from '@/features/common/AddCategorySheet'
import { createClient } from '@/lib/supabase/client'
import { useInvalidateAppData } from '@/lib/query/invalidate'
import { useOnline } from '@/lib/query/online'
import { MONTHS, CURRENCY } from '@/lib/constants'
import { fmt } from '@/lib/format'
import type { BudgetSetData } from '../queries'
import type { Category } from '@/types'

const STEP = 100

export default function BudgetSetForm({ data }: { data: BudgetSetData }) {
  const router = useRouter()
  const invalidateAppData = useInvalidateAppData()
  const { groupId, groupName, month, year } = data

  const [allocations, setAllocations] = useState<Record<string, number>>(data.allocations)
  // null: the total is the sum of the categories. A number: a total the user set
  // themselves, which category changes leave alone. A saved budget whose total
  // differs from its allocations opens with that total kept.
  const [fixedTotal, setFixedTotal] = useState<number | null>(() => {
    const sum = Object.values(data.allocations).reduce((s, v) => s + v, 0)
    return data.totalBudget > 0 && data.totalBudget !== sum ? data.totalBudget : null
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editingTotal, setEditingTotal] = useState(false)
  const [categories, setCategories] = useState<Category[]>(data.categories)
  const [addingCategory, setAddingCategory] = useState(false)
  const [error, setError] = useState('')
  const online = useOnline()

  function handleCategoryCreated(cat: Category) {
    setCategories(prev => [...prev, cat].sort((a, b) => a.name.localeCompare(b.name)))
    setAllocations(prev => ({ ...prev, [cat.id]: 0 }))
  }

  // Only ever changes this category; the total follows on its own or stays as set.
  function setCategoryAmount(catId: string, newValue: number) {
    setAllocations(prev => ({ ...prev, [catId]: Math.max(0, newValue) }))
  }

  function adjust(catId: string, delta: number) {
    setCategoryAmount(catId, (allocations[catId] ?? 0) + delta)
  }

  const totalAllocated = Object.values(allocations).reduce((s, v) => s + v, 0)
  const totalBudget = fixedTotal ?? totalAllocated
  const unallocated = totalBudget - totalAllocated
  const allocPct = totalBudget > 0 ? Math.min(100, (totalAllocated / totalBudget) * 100) : 0
  const categoryCount = Object.values(allocations).filter(v => v > 0).length

  async function handleSave() {
    setLoading(true)
    setError('')
    // One transaction (supabase/schema.sql): the budget and its allocations are
    // saved together, so a failure can't leave the budget with allocations wiped.
    const { error: saveError } = await createClient().rpc('save_budget', {
      p_group_id: groupId,
      p_month: month,
      p_year: year,
      p_total: totalBudget,
      p_allocations: Object.entries(allocations).map(([category_id, allocated_amount]) => ({ category_id, allocated_amount })),
    })
    if (saveError) {
      setError(saveError.message)
      setLoading(false)
      return
    }

    await invalidateAppData()
    setSaved(true)
    setLoading(false)
    setTimeout(() => router.push('/dashboard'), 1000)
  }

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <div className="flex items-center gap-3.5 px-5 pt-12 pb-0">
        <button onClick={() => router.back()} aria-label="Back" className="w-11 h-11 rounded-[14px] flex items-center justify-center" style={{ background: '#fff', border: '1px solid var(--line)', color: 'var(--ink)' }}>
          <CaretLeft size={17} weight="bold" />
        </button>
        <div>
          <div className="text-[13px] font-semibold" style={{ color: 'var(--muted)' }}>{groupName} group</div>
          <div className="text-[19px] font-extrabold tracking-tight" style={{ color: 'var(--ink)' }}>Set {MONTHS[month - 1]} budget</div>
        </div>
      </div>

      {/* Total card */}
      <div className="mx-5 mt-5 rounded-3xl p-5" style={{ background: '#fff', border: '1px solid var(--hairline)' }}>
        <label htmlFor="budget-total" className="text-[13px] font-semibold" style={{ color: 'var(--muted)' }}>Total for {MONTHS[month - 1]}</label>
        <div className="flex items-end gap-2 mt-1.5">
          <span className="text-[15px] font-bold pb-1.5" style={{ color: 'var(--muted)' }}>{CURRENCY}</span>
          {editingTotal ? (
            <input
              id="budget-total"
              type="text"
              inputMode="numeric"
              autoFocus
              value={fixedTotal ? fmt(fixedTotal) : ''}
              placeholder="0"
              onChange={e => setFixedTotal(parseInt(e.target.value.replace(/\D/g, '')) || 0)}
              // Selected on open so typing replaces the total rather than adding digits to it.
              onFocus={e => e.target.select()}
              onBlur={() => setEditingTotal(false)}
              className="text-[38px] font-extrabold tracking-tight leading-none tabular-nums w-48 outline-none bg-transparent"
              style={{ color: 'var(--ink)' }}
            />
          ) : (
            <span className="text-[38px] font-extrabold tracking-tight leading-none tabular-nums" style={{ color: 'var(--ink)' }}>{fmt(totalBudget)}</span>
          )}
          {!editingTotal && (
            <button
              type="button"
              // Typing a total takes it off auto from here on.
              onClick={() => { setFixedTotal(totalBudget); setEditingTotal(true) }}
              aria-label="Edit total budget"
              className="tap-target pb-1.5"
              style={{ color: 'var(--primary)' }}
            >
              <PencilSimple size={18} weight="bold" />
            </button>
          )}
        </div>

        {fixedTotal === null ? (
          <div className="flex items-center gap-1.5 mt-3 text-[13px] font-semibold" style={{ color: 'var(--ink-2)' }}>
            <CheckCircle size={15} weight="fill" style={{ color: 'var(--income)' }} aria-hidden="true" />
            {categoryCount === 0
              ? 'Add amounts below and the total adds them up'
              : `Sum of ${categoryCount} categor${categoryCount === 1 ? 'y' : 'ies'} · changes as you edit them`}
          </div>
        ) : (
          <>
            <div className="h-2.5 rounded-full mt-4 overflow-hidden" style={{ background: 'var(--track)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${allocPct}%`, background: unallocated < 0 ? 'var(--danger)' : 'var(--primary)' }} />
            </div>
            {unallocated >= 0 ? (
              <div className="flex justify-between gap-3 mt-3 text-[12px] font-bold">
                <span style={{ color: 'var(--ink-2)' }}>Allocated {fmt(totalAllocated)}</span>
                <span style={{ color: 'var(--muted)' }}>{unallocated > 0 ? `${fmt(unallocated)} not in a category` : 'All allocated'}</span>
              </div>
            ) : (
              <div className="flex items-start gap-1.5 mt-3 text-[12px] font-bold" style={{ color: 'var(--danger)' }}>
                <WarningCircle size={15} weight="fill" className="shrink-0" aria-hidden="true" />
                Categories add up to {fmt(totalAllocated)}, {fmt(-unallocated)} more than this total
              </div>
            )}
            <button
              type="button"
              onClick={() => { setFixedTotal(null); setEditingTotal(false) }}
              className="mt-3 min-h-10 rounded-full px-3.5 text-[13px] font-bold"
              style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}
            >
              {unallocated < 0 ? `Raise total to ${fmt(totalAllocated)}` : `Use sum of categories (${fmt(totalAllocated)})`}
            </button>
          </>
        )}
      </div>

      {/* Category steppers */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <span className="text-base font-extrabold" style={{ color: 'var(--ink)' }}>Allocate by category</span>
        <button onClick={() => setAddingCategory(true)} className="flex items-center gap-1 min-h-10 px-1 text-[13px] font-bold" style={{ color: 'var(--primary)' }}>
          <Plus size={13} weight="bold" /> Add category
        </button>
      </div>
      <div className="mx-5 flex flex-col gap-2.5">
        {categories.map(cat => (
          <div key={cat.id} className="flex items-center gap-3.5 rounded-[18px] py-3 px-3.5" style={{ background: '#fff', border: '1px solid var(--hairline)' }}>
            <CategoryIcon icon={cat.icon} color={cat.color} bg_color={cat.bg_color} size={40} iconSize={20} radius={12} />
            <span className="flex-1 text-[14px] font-bold" style={{ color: 'var(--ink)' }}>{cat.name}</span>
            <div className="flex items-center gap-2.5">
              <button onClick={() => adjust(cat.id, -STEP)} aria-label={`Decrease ${cat.name} by ${STEP}`} className="tap-target w-7 h-7 rounded-[9px] flex items-center justify-center" style={{ background: 'var(--hairline)', color: 'var(--ink-2)' }}>
                <svg width="13" height="2" viewBox="0 0 13 2"><rect x="0" y="0" width="13" height="2" rx="1" fill="currentColor"/></svg>
              </button>
              <input
                type="number"
                inputMode="numeric"
                value={allocations[cat.id] ?? 0}
                onChange={e => setCategoryAmount(cat.id, parseInt(e.target.value) || 0)}
                onFocus={e => e.target.select()}
                className="text-[16px] font-extrabold text-center tabular-nums outline-none bg-transparent"
                style={{ color: 'var(--ink)', width: 56 }}
              />
              <button onClick={() => adjust(cat.id, STEP)} aria-label={`Increase ${cat.name} by ${STEP}`} className="tap-target w-7 h-7 rounded-[9px] flex items-center justify-center" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                <Plus size={13} weight="bold" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <AddCategorySheet
        open={addingCategory}
        onClose={() => setAddingCategory(false)}
        groupId={groupId}
        existing={categories}
        onCreated={handleCategoryCreated}
      />

      {error && <p className="mx-5 mt-4 text-xs font-semibold rounded-xl px-3 py-2" style={{ color: 'var(--danger)', background: 'var(--danger-soft)' }}>{error}</p>}

      {/* Save button */}
      <div className="sticky bottom-20 px-5 mt-6" style={{ background: 'linear-gradient(180deg,rgba(246,243,238,0),var(--background) 38%)' }}>
        <button
          onClick={handleSave}
          disabled={loading || saved || !online}
          className="w-full flex items-center justify-center gap-2.5 rounded-[17px] py-4 text-base font-extrabold text-white transition-opacity disabled:opacity-70"
          style={{ background: saved ? 'var(--income)' : 'var(--primary)', boxShadow: '0 14px 24px -10px rgba(59,111,246,.7)' }}
        >
          {saved ? <><Check size={18} weight="bold" /> Saved!</> : loading ? 'Saving…' : !online ? 'Connect to save the budget' : <><Check size={18} weight="fill" /> Save {MONTHS[month - 1]} budget</>}
        </button>
      </div>
    </div>
  )
}
