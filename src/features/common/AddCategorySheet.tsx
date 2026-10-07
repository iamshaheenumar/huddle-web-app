'use client'

import { useState } from 'react'
import { Check, PlusCircle } from '@phosphor-icons/react'
import BottomSheet from './BottomSheet'
import CategoryIcon, { CATEGORY_ICON_NAMES } from './CategoryIcon'
import { createClient } from '@/lib/supabase/client'
import { revalidateAppData } from '@/lib/actions'
import { CATEGORY_COLORS, colorUsage, pickUnusedColor } from '@/lib/categories'
import type { Category } from '@/types'

const MAX_NAME = 24

type Props = {
  open: boolean
  onClose: () => void
  groupId: string
  // Categories the group can already see (defaults + custom), for duplicate
  // checks and picking an unused color.
  existing: Category[]
  onCreated: (category: Category) => void
}

export default function AddCategorySheet({ open, onClose, groupId, existing, onCreated }: Props) {
  const [pending, setPending] = useState(false)

  return (
    <BottomSheet open={open} onClose={onClose} locked={pending} labelledBy="add-category-title">
      {/* Unmounted while closed, so every open starts from fresh defaults. */}
      <AddCategoryForm
        groupId={groupId}
        existing={existing}
        pending={pending}
        setPending={setPending}
        onCancel={onClose}
        onCreated={cat => { onCreated(cat); onClose() }}
      />
    </BottomSheet>
  )
}

type FormProps = {
  groupId: string
  existing: Category[]
  pending: boolean
  setPending: (pending: boolean) => void
  onCancel: () => void
  onCreated: (category: Category) => void
}

function AddCategoryForm({ groupId, existing, pending, setPending, onCancel, onCreated }: FormProps) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState(() => {
    const used = new Set(existing.map(c => c.icon))
    return CATEGORY_ICON_NAMES.find(n => !used.has(n)) ?? CATEGORY_ICON_NAMES[0]
  })
  const [color, setColor] = useState(() => pickUnusedColor(existing))
  const [error, setError] = useState('')

  const usage = colorUsage(existing)
  const trimmed = name.trim()

  async function handleSave() {
    if (!trimmed) {
      setError('Give your category a name')
      return
    }
    const duplicate = existing.find(c => c.name.toLowerCase() === trimmed.toLowerCase())
    if (duplicate) {
      setError(`“${duplicate.name}” already exists`)
      return
    }

    setPending(true)
    setError('')
    const supabase = createClient()
    const { data, error: insertError } = await supabase
      .from('categories')
      .insert({ name: trimmed, icon, color: color.color, bg_color: color.bg_color, is_default: false, group_id: groupId } as never)
      .select()
      .single()

    if (insertError || !data) {
      setError(insertError?.code === '23505' ? `“${trimmed}” already exists` : insertError?.message ?? 'Could not add category')
      setPending(false)
      return
    }

    await revalidateAppData()
    setPending(false)
    onCreated(data as Category)
  }

  return (
    <>
      <div className="flex flex-col items-center text-center pt-5">
        <CategoryIcon icon={icon} color={color.color} bg_color={color.bg_color} size={56} iconSize={28} radius={18} />
        <div id="add-category-title" className="text-[18px] font-extrabold mt-3" style={{ color: trimmed ? color.color : '#20242E' }}>
          {trimmed || 'New category'}
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="category-name" className="text-[13px] font-bold block mb-2" style={{ color: '#6B707A' }}>Name</label>
        <div className="flex items-center gap-3 rounded-[15px] px-4 py-3.5" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
          <input
            id="category-name"
            type="text"
            autoFocus
            autoComplete="off"
            maxLength={MAX_NAME}
            placeholder="e.g. Gym, Pets, Kids"
            value={name}
            onChange={e => { setName(e.target.value); if (error) setError('') }}
            onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
            className="flex-1 text-[14px] font-semibold bg-transparent outline-none"
            style={{ color: '#2A2E37' }}
          />
          <span className="text-[11px] font-bold tabular-nums" style={{ color: '#B6BAC1' }}>{name.length}/{MAX_NAME}</span>
        </div>
      </div>

      <div className="mt-5">
        <div className="text-[13px] font-bold mb-2" style={{ color: '#6B707A' }}>Icon</div>
        <div className="grid grid-cols-6 gap-2 rounded-[18px] p-2.5" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
          {CATEGORY_ICON_NAMES.map(n => {
            const selected = n === icon
            return (
              <button
                key={n}
                type="button"
                aria-label={n}
                aria-pressed={selected}
                onClick={() => setIcon(n)}
                className="flex items-center justify-center aspect-square rounded-[12px] transition-all"
                style={selected ? { boxShadow: `0 0 0 2px ${color.color}` } : undefined}
              >
                <CategoryIcon
                  icon={n}
                  color={selected ? color.color : '#787D87'}
                  bg_color={selected ? color.bg_color : 'transparent'}
                  size={38}
                  iconSize={19}
                  radius={10}
                />
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-5">
        <div className="text-[13px] font-bold mb-2" style={{ color: '#6B707A' }}>Color</div>
        <div className="flex flex-wrap gap-2.5">
          {CATEGORY_COLORS.map(c => {
            const selected = c.color === color.color
            const inUse = usage.has(c.color.toUpperCase())
            return (
              <button
                key={c.color}
                type="button"
                aria-label={`${c.color}${inUse ? ' (in use)' : ''}`}
                aria-pressed={selected}
                onClick={() => setColor(c)}
                className="relative flex items-center justify-center rounded-full transition-all"
                style={{
                  width: 34,
                  height: 34,
                  background: c.color,
                  boxShadow: selected ? `0 0 0 2px #F6F3EE, 0 0 0 4px ${c.color}` : undefined,
                }}
              >
                {selected && <Check size={15} weight="bold" color="#fff" />}
                {inUse && !selected && (
                  <span className="absolute rounded-full" style={{ width: 6, height: 6, background: 'rgba(255,255,255,.85)' }} />
                )}
              </button>
            )
          })}
        </div>
        <p className="text-[11px] font-semibold mt-2" style={{ color: '#B6BAC1' }}>Dotted colors are already used by another category.</p>
      </div>

      {error && <p className="text-xs font-semibold rounded-xl px-3 py-2 mt-4" style={{ color: '#E0563E', background: '#FBE7E1' }}>{error}</p>}

      <div className="flex flex-col gap-2.5 mt-5">
        <button
          onClick={handleSave}
          disabled={pending}
          className="w-full flex items-center justify-center gap-2.5 rounded-[17px] py-4 text-base font-extrabold text-white transition-opacity disabled:opacity-60"
          style={{ background: '#3B6FF6', boxShadow: '0 14px 24px -10px rgba(59,111,246,.7)' }}
        >
          <PlusCircle size={18} weight="fill" />
          {pending ? 'Adding…' : 'Add category'}
        </button>
        <button
          onClick={onCancel}
          disabled={pending}
          className="w-full rounded-[17px] py-3.5 text-[15px] font-bold disabled:opacity-60"
          style={{ background: '#fff', border: '1px solid #EAE5DD', color: '#3A3F49' }}
        >
          Cancel
        </button>
      </div>
    </>
  )
}
