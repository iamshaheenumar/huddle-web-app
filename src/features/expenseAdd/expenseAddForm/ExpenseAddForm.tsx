'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Plus, PlusCircle, CheckCircle, NotePencil, CalendarBlank, Trash, FloppyDisk } from '@phosphor-icons/react'
import CategoryIcon from '@/features/common/CategoryIcon'
import AddCategorySheet from '@/features/common/AddCategorySheet'
import ConfirmSheet from '@/features/common/ConfirmSheet'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ADD_EXPENSE, ADD_RECURRING, UPDATE_RECURRING, DELETE_RECURRING,
  type ExpenseDraft, type RecurringDraft, type RecurringUpdate, type RecurringDelete, type RecurringRule,
} from '@/lib/query/mutations'
import { persistNow } from '@/lib/query/client'
import { CURRENCY } from '@/lib/constants'
import { INCOME_COLOR } from '@/lib/transactions'
import { createsFirstPayment, editedPosition, initialPosition } from '@/lib/recurring'
import { todayDate, yesterdayDate } from '@/features/dashboard/dates'
import type { RecurringRow } from '@/features/recurring/queries'
import RecurringSection, { type RecurringSettings } from '../recurringSection/RecurringSection'
import KindToggle from '../kindToggle/KindToggle'
import type { ExpenseAddData } from '../queries'
import type { Category, TxnKind } from '@/types'

type Props = {
  data: ExpenseAddData
  // Opens with the recurring toggle on (from the recurring screen's "+").
  startRecurring?: boolean
  // Opens on the Income tab.
  startIncome?: boolean
  // Edits this recurring payment instead of adding an expense.
  editing?: RecurringRow
}

// What was typed, as a plain number string: digits, one point, two decimals at most.
function cleanAmount(input: string) {
  const [whole, ...rest] = input.replace(/[^0-9.]/g, '').split('.')
  const int = whole.replace(/^0+(?=\d)/, '') || (rest.length ? '0' : '')
  return rest.length ? `${int}.${rest.join('').slice(0, 2)}` : int
}

// "1250.5" → "1,250.5", keeping a trailing "." while it's being typed.
function groupAmount(raw: string) {
  if (!raw) return ''
  const [int, dec] = raw.split('.')
  const grouped = Number(int || '0').toLocaleString('en-US')
  return dec === undefined ? grouped : `${grouped}.${dec}`
}

export default function ExpenseAddForm({ data, startRecurring, startIncome, editing }: Props) {
  const router = useRouter()
  const { groupId, groupName, members } = data
  const [categories, setCategories] = useState<Category[]>(data.categories)
  const [addingCategory, setAddingCategory] = useState(false)
  // These run from the mutation defaults (src/lib/query/mutations.ts), so they
  // are queued while offline and survive this screen closing.
  const addExpense = useMutation<void, Error, ExpenseDraft>({ mutationKey: ADD_EXPENSE })
  const addRecurring = useMutation<void, Error, RecurringDraft>({ mutationKey: ADD_RECURRING })
  const updateRecurring = useMutation<void, Error, RecurringUpdate>({ mutationKey: UPDATE_RECURRING })
  const deleteRecurring = useMutation<void, Error, RecurringDelete>({ mutationKey: DELETE_RECURRING })
  const queryClient = useQueryClient()

  // A recurring payment keeps its kind when edited.
  const [kind, setKind] = useState<TxnKind>(editing?.kind ?? (startIncome ? 'income' : 'expense'))
  const income = kind === 'income'
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '')
  const [paidBy, setPaidBy] = useState<string | null>(editing?.paid_by ?? data.currentUserId)
  // No default: a silently pre-picked category is how spend ends up mis-filed.
  const [categoryId, setCategoryId] = useState<string | null>(editing?.category_id ?? null)
  const [note, setNote] = useState(editing?.note ?? '')
  const [date, setDate] = useState(editing?.start_date ?? todayDate())
  const [recurring, setRecurring] = useState(!!editing || !!startRecurring)
  const [settings, setSettings] = useState<RecurringSettings>({
    frequency: editing?.frequency ?? 'monthly',
    end_type: editing?.end_type ?? 'never',
    end_date: editing?.end_date ?? null,
    max_occurrences: editing?.max_occurrences ?? null,
  })
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const today = todayDate()
  const schedule = { ...settings, start_date: date }
  const nextDue = editing
    ? editedPosition(editing, schedule, today).next_due_date
    : initialPosition(schedule, today).next_due_date

  async function handleAdd() {
    if (!groupId || !paidBy || (!income && !categoryId) || !amount) {
      setError('Please fill in all required fields')
      return
    }
    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Enter a valid amount')
      return
    }
    if (recurring && settings.end_type === 'on_date' && settings.end_date && settings.end_date < date) {
      setError('The end date is before the start date')
      return
    }
    setLoading(true)
    setError('')
    const payer = members.find(m => m.id === paidBy)
    const category = income ? undefined : categories.find(c => c.id === categoryId)
    const categoryDisplay = category ? { name: category.name, icon: category.icon, color: category.color, bg_color: category.bg_color } : null
    const createdAt = new Date().toISOString()
    const expense = (id: string, recurringId: string | null): ExpenseDraft => ({
      id,
      group_id: groupId,
      kind,
      // Income has no category.
      category_id: income ? null : categoryId,
      paid_by: paidBy,
      amount: parsedAmount,
      note: note || null,
      expense_date: date,
      created_at: createdAt,
      recurring_id: recurringId,
      profiles: payer ? { display_name: payer.display_name, avatar_color: payer.avatar_color } : null,
      categories: categoryDisplay,
    })

    // All of these show straight away and sync now, or once back online.
    if (recurring) {
      const rule: RecurringRule = {
        id: editing?.id ?? crypto.randomUUID(),
        group_id: groupId,
        kind,
        category_id: income ? null : categoryId,
        paid_by: paidBy,
        amount: parsedAmount,
        note: note || null,
        frequency: settings.frequency,
        start_date: date,
        end_type: settings.end_type,
        end_date: settings.end_date,
        max_occurrences: settings.max_occurrences,
      }
      if (editing) {
        updateRecurring.mutate({ rule, categories: categoryDisplay })
      } else {
        // Starting today or earlier logs the first payment now; later ones are
        // added automatically on each due date.
        const firstExpense = createsFirstPayment(rule, today) ? expense(crypto.randomUUID(), rule.id) : null
        addRecurring.mutate({ rule, created_at: createdAt, categories: categoryDisplay, firstExpense })
      }
    } else {
      addExpense.mutate(expense(crypto.randomUUID(), null))
    }
    await persistNow(queryClient)
    router.push(editing || startRecurring ? '/recurring' : '/dashboard')
  }

  async function handleDelete() {
    if (!editing) return
    deleteRecurring.mutate({ id: editing.id })
    setConfirmingDelete(false)
    await persistNow(queryClient)
    router.push('/recurring')
  }

  const yesterday = yesterdayDate()
  const pickedDate = date !== today && date !== yesterday
  const dateChips = [
    { value: today, label: 'Today' },
    { value: yesterday, label: 'Yesterday' },
  ]
  const pickedLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' })

  const shownAmount = groupAmount(amount)
  const category = categories.find(c => c.id === categoryId)
  const hasAmount = parseFloat(amount) > 0
  // Says what's missing, then exactly what will be saved.
  const submitLabel = editing
    ? 'Save changes'
    : !hasAmount
      ? 'Enter an amount'
      : !income && !category
        ? 'Choose a category'
        : `Add ${recurring ? 'recurring ' : ''}${CURRENCY} ${shownAmount}${income ? ' income' : ` to ${category!.name}`}`
  const ready = editing ? true : hasAmount && (income || !!category)
  const SubmitIcon = editing ? FloppyDisk : income ? CheckCircle : PlusCircle

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-0">
        <button onClick={() => router.back()} aria-label="Close" className="w-11 h-11 rounded-[14px] flex items-center justify-center" style={{ background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--ink)' }}>
          <X size={16} weight="bold" />
        </button>
        <div className="flex flex-col items-center min-w-0 px-2">
          <span className="text-section font-extrabold" style={{ color: 'var(--ink)' }}>{editing ? 'Edit recurring' : income ? 'Add income' : 'Add expense'}</span>
          <span className="text-meta font-medium truncate max-w-full" style={{ color: 'var(--muted)' }}>in {groupName}</span>
        </div>
        {editing ? (
          <button onClick={() => setConfirmingDelete(true)} aria-label={income ? 'Delete recurring income' : 'Delete recurring payment'} className="w-11 h-11 rounded-[14px] flex items-center justify-center" style={{ background: 'var(--danger-soft)', color: 'var(--danger-text)' }}>
            <Trash size={17} weight="bold" />
          </button>
        ) : (
          // Balances the close button so the title stays centred.
          <div className="w-11 h-11" aria-hidden="true" />
        )}
      </div>

      {!editing && <KindToggle value={kind} onChange={setKind} />}

      {/* Amount */}
      <div className="text-center px-5 pt-6 pb-1">
        <label htmlFor="amount" className="text-meta font-medium" style={{ color: 'var(--muted)' }}>Amount</label>
        <div className="flex items-baseline justify-center gap-2 mt-1.5">
          <span className="text-title font-bold shrink-0" style={{ color: 'var(--muted)' }}>{income ? `+ ${CURRENCY}` : CURRENCY}</span>
          <input
            id="amount"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0"
            value={shownAmount}
            onChange={e => setAmount(cleanAmount(e.target.value))}
            className="text-display font-extrabold tracking-tight leading-none tabular-nums bg-transparent outline-none min-w-0"
            // Sized to the digits so the currency stays beside the number.
            style={{ color: income ? INCOME_COLOR : 'var(--ink)', width: `${Math.max(1, shownAmount.length) + 0.5}ch`, maxWidth: '100%' }}
          />
        </div>
      </div>

      {/* Paid by / Received by */}
      <div className="px-5 pt-5">
        <div className="text-body font-bold mb-2.5" style={{ color: 'var(--ink-2)' }}>{income ? 'Received by' : 'Paid by'}</div>
        <div className="flex gap-2 flex-wrap">
          {members.map(m => {
            const selected = paidBy === m.id
            const name = m.id === data.currentUserId ? 'You' : m.display_name.split(' ')[0]
            return (
              <button
                key={m.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setPaidBy(m.id)}
                className="flex items-center gap-2 rounded-full min-h-11 pl-1 pr-3.5 text-body transition-colors"
                style={selected
                  ? { background: 'var(--primary)', color: '#fff', fontWeight: 700 }
                  : { background: 'var(--card)', color: 'var(--ink)', border: '1px solid var(--line)', fontWeight: 600 }
                }
              >
                <span className="rounded-full flex items-center justify-center font-extrabold flex-shrink-0 text-meta"
                  style={{ width: 32, height: 32, background: selected ? 'rgba(255,255,255,.22)' : m.avatar_color, color: '#fff' }}>
                  {m.display_name.charAt(0).toUpperCase()}
                </span>
                {name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Category (expenses only) */}
      {!income && <div className="px-5 pt-5">
        <div className="flex items-baseline justify-between mb-2.5">
          <span className="text-body font-bold" style={{ color: 'var(--ink-2)' }}>Category</span>
          <span className="text-meta font-medium" style={{ color: 'var(--muted)' }}>Most used first</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {categories.map(cat => {
            const selected = categoryId === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setCategoryId(cat.id)}
                className="flex flex-col items-center gap-1.5 rounded-[16px] px-1 pt-2.5 pb-2 min-h-20 transition-colors"
                style={selected
                  ? { background: cat.bg_color, boxShadow: `inset 0 0 0 2px ${cat.color}` }
                  : { background: 'var(--card)', boxShadow: 'inset 0 0 0 1px var(--hairline)' }
                }
              >
                <CategoryIcon icon={cat.icon} color={cat.color} bg_color={selected ? 'var(--card)' : cat.bg_color} size={38} iconSize={19} radius={12} />
                <span className="text-meta leading-tight text-center line-clamp-2" style={{ color: 'var(--ink)', fontWeight: selected ? 700 : 600 }}>{cat.name}</span>
              </button>
            )
          })}
          <button
            type="button"
            onClick={() => setAddingCategory(true)}
            className="flex flex-col items-center gap-1.5 rounded-[16px] px-1 pt-2.5 pb-2 min-h-20"
            style={{ color: 'var(--primary-text)', boxShadow: 'inset 0 0 0 1.5px var(--primary-line)' }}
          >
            <span className="flex items-center justify-center rounded-[12px]" style={{ width: 38, height: 38, background: 'var(--primary-soft)' }}>
              <Plus size={18} weight="bold" />
            </span>
            <span className="text-meta font-bold leading-tight">New</span>
          </button>
        </div>
      </div>}

      <AddCategorySheet
        open={addingCategory}
        onClose={() => setAddingCategory(false)}
        groupId={groupId}
        existing={categories}
        onCreated={cat => {
          setCategories(prev => [...prev, cat])
          setCategoryId(cat.id)
        }}
      />

      {/* Note + Date */}
      <div className="px-5 pt-5 flex flex-col gap-2.5">
        <div className="flex items-center gap-3 rounded-[15px] px-4 py-3.5" style={{ background: 'var(--card)', border: '1px solid var(--hairline)' }}>
          <NotePencil size={18} style={{ color: 'var(--muted)' }} />
          <input
            type="text"
            aria-label="Note"
            placeholder="What was it for? (optional)"
            value={note}
            onChange={e => setNote(e.target.value)}
            className="flex-1 text-input font-semibold bg-transparent outline-none"
            style={{ color: 'var(--ink)' }}
          />
        </div>
        <div role="radiogroup" aria-label={recurring ? 'Start date' : 'Date'} className="flex gap-2 flex-wrap">
          {dateChips.map(c => {
            const selected = date === c.value
            return (
              <button
                key={c.label}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setDate(c.value)}
                className="min-h-10 rounded-full px-4 text-meta transition-colors"
                style={selected
                  ? { background: 'var(--inverse)', color: 'var(--on-inverse)', fontWeight: 700 }
                  : { background: 'var(--card)', color: 'var(--ink)', border: '1px solid var(--line)', fontWeight: 600 }}
              >
                {c.label}
              </button>
            )
          })}
          {/* The native picker sits invisibly over the chip so it opens on tap. */}
          <label
            className="relative flex items-center gap-1.5 min-h-10 rounded-full px-4 text-meta cursor-pointer focus-within:outline-2 focus-within:outline-offset-2"
            style={pickedDate
              ? { background: 'var(--inverse)', color: 'var(--on-inverse)', fontWeight: 700, outlineColor: 'var(--focus-ring)' }
              : { background: 'var(--card)', color: 'var(--ink)', border: '1px solid var(--line)', fontWeight: 600, outlineColor: 'var(--focus-ring)' }}
          >
            <CalendarBlank size={15} weight="bold" />
            {pickedDate ? pickedLabel : 'Pick date…'}
            <input
              type="date"
              aria-label="Pick a date"
              value={date}
              onChange={e => e.target.value && setDate(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer text-input"
            />
          </label>
        </div>
      </div>

      <RecurringSection
        income={income}
        enabled={recurring}
        onEnabledChange={editing ? undefined : setRecurring}
        settings={settings}
        onChange={setSettings}
        startDate={date}
        nextDue={nextDue}
        showManageLink={!editing}
      />

      {editing && (
        <ConfirmSheet
          open={confirmingDelete}
          onClose={() => setConfirmingDelete(false)}
          onConfirm={handleDelete}
          icon={<Trash size={24} weight="bold" />}
          title={income ? 'Delete recurring income?' : 'Delete recurring payment?'}
          description={income
            ? 'No more deposits will be added. Income already logged stays in your history.'
            : 'No more payments will be added. Payments already logged stay in your history.'}
          confirmLabel="Delete"
        />
      )}

      {error &&<p className="mx-5 mt-3 text-meta font-semibold rounded-xl px-3 py-2" style={{ color: 'var(--danger-text)', background: 'var(--danger-soft)' }}>{error}</p>}

      {/* Add button */}
      <div className="sticky bottom-0 px-5 mt-auto pt-6 pb-[calc(env(safe-area-inset-bottom)+16px)]" style={{ background: 'linear-gradient(180deg,rgba(246,243,238,0),var(--background) 38%)' }}>
        <button
          onClick={handleAdd}
          disabled={loading || !ready}
          className="w-full flex items-center justify-center gap-2.5 rounded-[17px] py-4 text-row font-extrabold transition-colors disabled:cursor-not-allowed"
          style={ready
            ? { background: 'var(--primary)', color: '#fff', boxShadow: '0 14px 24px -10px rgba(59,111,246,.7)' }
            : { background: 'var(--disabled)', color: 'var(--disabled-ink)' }}
        >
          {ready && <SubmitIcon size={18} weight="fill" />}
          <span className="truncate">{loading ? 'Saving…' : submitLabel}</span>
        </button>
      </div>
    </div>
  )
}
