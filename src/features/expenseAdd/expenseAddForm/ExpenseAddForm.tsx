'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, PlusCircle, NotePencil, CalendarBlank, CaretDown } from '@phosphor-icons/react'
import CategoryIcon from '@/features/common/CategoryIcon'
import { createClient } from '@/lib/supabase/client'
import { CURRENCY } from '@/lib/constants'
import type { ExpenseAddData } from '../data'

export default function ExpenseAddForm({ data }: { data: ExpenseAddData }) {
  const router = useRouter()
  const { groupId, groupName, members, categories } = data

  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState<string | null>(data.currentUser?.id ?? null)
  const [categoryId, setCategoryId] = useState<string | null>(categories[0]?.id ?? null)
  const [note, setNote] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleAdd() {
    if (!groupId || !paidBy || !categoryId || !amount) {
      setError('Please fill in all required fields')
      return
    }
    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Enter a valid amount')
      return
    }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: insertError } = await supabase.from('expenses').insert({
      group_id: groupId,
      category_id: categoryId,
      paid_by: paidBy,
      amount: parsedAmount,
      note: note || null,
      expense_date: date,
    } as never)
    if (insertError) {
      setError(insertError.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('en-AE', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#F6F3EE' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-0">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-[13px] flex items-center justify-center" style={{ background: '#fff', border: '1px solid #EAE5DD', color: '#3A3F49' }}>
          <X size={16} weight="bold" />
        </button>
        <span className="text-[17px] font-extrabold" style={{ color: '#20242E' }}>Add expense</span>
        <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold text-white" style={{ background: '#20242E' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          {groupName}
        </div>
      </div>

      {/* Amount */}
      <div className="text-center px-5 pt-7 pb-2">
        <div className="text-[13px] font-semibold" style={{ color: '#9A9FA8' }}>Amount</div>
        <div className="flex items-start justify-center gap-2 mt-2">
          <span className="text-[20px] font-bold pt-2.5" style={{ color: '#9A9FA8' }}>{CURRENCY}</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="text-[50px] font-extrabold tracking-tight leading-none text-center bg-transparent outline-none w-44"
            style={{ color: '#20242E' }}
          />
          <span className="text-[28px] font-bold pt-1.5" style={{ color: '#B6BAC1' }}>.00</span>
        </div>
      </div>

      {/* Paid by */}
      <div className="px-5 pt-5">
        <div className="text-[13px] font-bold mb-2.5" style={{ color: '#6B707A' }}>Paid by</div>
        <div className="flex gap-2.5 flex-wrap">
          {members.map(m => {
            const selected = paidBy === m.id
            return (
              <button
                key={m.id}
                onClick={() => setPaidBy(m.id)}
                className="flex items-center gap-2 rounded-full transition-all"
                style={selected
                  ? { background: '#3B6FF6', color: '#fff', padding: '6px 13px 6px 6px' }
                  : { width: 38, height: 38, background: '#fff', border: '1px solid #EAE5DD', borderRadius: '50%', justifyContent: 'center' }
                }
              >
                <div className="rounded-full flex items-center justify-center font-extrabold flex-shrink-0 text-[12px]"
                  style={{ width: 26, height: 26, background: selected ? 'rgba(255,255,255,.25)' : m.avatar_color, color: selected ? '#fff' : '#fff' }}>
                  {m.display_name.charAt(0)}
                </div>
                {selected && <span className="text-[13px] font-bold">{m.display_name.split(' ')[0]}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Category */}
      <div className="px-5 pt-5">
        <div className="text-[13px] font-bold mb-2.5" style={{ color: '#6B707A' }}>Category</div>
        <div className="flex flex-wrap gap-2.5">
          {categories.map(cat => {
            const selected = categoryId === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className="flex items-center gap-1.5 rounded-[13px] px-3 py-2.5 text-[13px] font-bold transition-all"
                style={selected
                  ? { background: cat.bg_color, color: cat.color, border: `1.5px solid ${cat.color}` }
                  : { background: '#fff', color: '#787D87', border: '1px solid #EAE5DD' }
                }
              >
                <CategoryIcon icon={cat.icon} color={selected ? cat.color : '#787D87'} bg_color="transparent" size={18} iconSize={16} radius={0} />
                {cat.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Note + Date */}
      <div className="px-5 pt-5 flex flex-col gap-2.5">
        <div className="flex items-center gap-3 rounded-[15px] px-4 py-3.5" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
          <NotePencil size={18} color="#9A9FA8" />
          <input
            type="text"
            placeholder="Add a note (optional)"
            value={note}
            onChange={e => setNote(e.target.value)}
            className="flex-1 text-[14px] font-semibold bg-transparent outline-none"
            style={{ color: '#2A2E37' }}
          />
        </div>
        <div className="relative flex items-center gap-3 rounded-[15px] px-4 py-3.5" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
          <CalendarBlank size={18} color="#9A9FA8" />
          <span className="flex-1 text-[14px] font-semibold" style={{ color: '#2A2E37' }}>{displayDate}</span>
          <CaretDown size={13} color="#B6BAC1" />
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {error && <p className="mx-5 mt-3 text-xs font-semibold rounded-xl px-3 py-2" style={{ color: '#E0563E', background: '#FBE7E1' }}>{error}</p>}

      {/* Add button */}
      <div className="sticky bottom-20 px-5 mt-6 pt-6" style={{ background: 'linear-gradient(180deg,rgba(246,243,238,0),#F6F3EE 38%)' }}>
        <button
          onClick={handleAdd}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 rounded-[17px] py-4 text-base font-extrabold text-white transition-opacity disabled:opacity-60"
          style={{ background: '#3B6FF6', boxShadow: '0 14px 24px -10px rgba(59,111,246,.7)' }}
        >
          <PlusCircle size={18} weight="fill" />
          {loading ? 'Adding…' : 'Add expense'}
        </button>
      </div>
    </div>
  )
}
