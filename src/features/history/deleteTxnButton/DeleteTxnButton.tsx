'use client'
import { useCallback, useState } from 'react'
import { TrashIcon } from '@phosphor-icons/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { persistNow } from '@/lib/query/client'
import CategoryIcon from '@/features/common/CategoryIcon'
import ConfirmSheet from '@/features/common/ConfirmSheet'
import IncomeIcon from '@/features/common/IncomeIcon'
import { INCOME_COLOR, isIncome, signedAmount } from '@/lib/transactions'
import { DELETE_EXPENSE, type ExpenseDelete } from '@/lib/query/mutations'
import type { HistoryTxn } from '../types'

// Same UTC parse as the list's day headers so the date never shifts.
const dateLabel = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString('en-AE', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })

export default function DeleteTxnButton({ txn }: { txn: HistoryTxn }) {
  const [open, setOpen] = useState(false)
  // Queued like adds (src/lib/query/mutations.ts): the row hides at once and
  // the delete syncs now, or once back online.
  const deleteExpense = useMutation<void, Error, ExpenseDelete>({ mutationKey: DELETE_EXPENSE })
  const queryClient = useQueryClient()
  const label = txn.note || txn.categoryName
  const income = isIncome(txn)

  const close = useCallback(() => setOpen(false), [])

  function handleDelete() {
    deleteExpense.mutate({ id: txn.id })
    setOpen(false)
    // Save the queued delete now, in case the app is closed or reloads offline.
    persistNow(queryClient)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={`Delete ${label}`}
        className="tap-target flex items-center justify-center rounded-[10px] shrink-0"
        style={{ width: 30, height: 30, color: 'var(--danger)', background: 'var(--danger-soft)', border: 'none' }}
      >
        <TrashIcon size={15} weight="bold" />
      </button>

      <ConfirmSheet
        open={open}
        onClose={close}
        onConfirm={handleDelete}
        icon={<TrashIcon size={24} weight="bold" />}
        title="Delete transaction?"
        description="It'll be removed from this month's totals for everyone in the group. This can't be undone."
        confirmLabel="Delete"
      >
        <div className="flex items-center gap-3 rounded-[20px] p-3.5" style={{ background: '#fff', border: '1px solid var(--hairline)' }}>
          {income
            ? <IncomeIcon size={40} iconSize={20} radius={12} />
            : txn.category && <CategoryIcon icon={txn.category.icon} color={txn.category.color} bg_color={txn.category.bg_color} size={40} iconSize={20} radius={12} />}
          <div className="flex-1 min-w-0 text-left">
            <div className="text-row font-bold truncate" style={{ color: 'var(--ink)' }}>{label}</div>
            <div className="text-meta font-medium mt-0.5 truncate" style={{ color: 'var(--muted)' }}>{txn.categoryName} · {dateLabel(txn.date)}</div>
          </div>
          <span className="text-row font-extrabold tabular-nums" style={{ color: income ? INCOME_COLOR : 'var(--ink)' }}>{signedAmount(txn)}</span>
        </div>
      </ConfirmSheet>
    </>
  )
}
