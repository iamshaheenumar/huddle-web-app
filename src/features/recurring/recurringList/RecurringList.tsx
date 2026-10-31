'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { Trash } from '@phosphor-icons/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import CategoryIcon from '@/features/common/CategoryIcon'
import IncomeIcon from '@/features/common/IncomeIcon'
import ConfirmSheet from '@/features/common/ConfirmSheet'
import { INCOME_COLOR, isIncome, signedAmount } from '@/lib/transactions'
import { persistNow } from '@/lib/query/client'
import { DELETE_RECURRING, type RecurringDelete } from '@/lib/query/mutations'
import { FREQUENCY_LABEL } from '@/lib/recurring'
import type { RecurringRow } from '../queries'
import RecurringListRow from './RecurringListRow'

export type RecurringFilter = 'all' | 'active' | 'paused'

const EMPTY_TEXT: Record<RecurringFilter, string> = {
  all: 'Nothing recurring yet.',
  active: 'Nothing recurring is running.',
  paused: 'Nothing is paused.',
}

export default function RecurringList({ rows, filter }: { rows: RecurringRow[]; filter: RecurringFilter }) {
  const queryClient = useQueryClient()
  const deleteRecurring = useMutation<void, Error, RecurringDelete>({ mutationKey: DELETE_RECURRING })
  const [openId, setOpenId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<RecurringRow | null>(null)
  const closeConfirm = useCallback(() => setDeleting(null), [])

  function handleDelete() {
    if (!deleting) return
    deleteRecurring.mutate({ id: deleting.id })
    setDeleting(null)
    setOpenId(null)
    // Save the queued delete now, in case the app is closed or reloads offline.
    persistNow(queryClient)
  }

  return (
    <>
      <div className="flex items-center justify-between px-5 pt-5">
        <span className="text-row font-extrabold" style={{ color: 'var(--ink)' }}>Upcoming</span>
        <span className="text-meta font-bold" style={{ color: 'var(--muted)' }}>Sorted by due date</span>
      </div>
      <div className="mx-5 mt-3 rounded-[20px] py-1 overflow-hidden" style={{ background: '#fff', border: '1px solid var(--hairline)' }}>
        {rows.length === 0 ? (
          <div className="py-[22px] px-4 text-center text-body font-medium" style={{ color: 'var(--muted)' }}>
            {EMPTY_TEXT[filter]}
            {filter === 'all' && (
              <> <Link href="/expense/add?recurring=1" className="font-bold" style={{ color: 'var(--primary)' }}>Add one</Link></>
            )}
          </div>
        ) : (
          rows.map((row, i) => (
            <RecurringListRow
              key={row.id}
              row={row}
              isLast={i === rows.length - 1}
              open={openId === row.id}
              onOpenChange={open => setOpenId(open ? row.id : null)}
              onDelete={() => setDeleting(row)}
            />
          ))
        )}
      </div>
      {rows.length > 0 && (
        <p className="px-6 pt-2.5 text-label font-semibold" style={{ color: 'var(--muted)' }}>Swipe left to delete · tap to edit</p>
      )}

      <ConfirmSheet
        open={deleting !== null}
        onClose={closeConfirm}
        onConfirm={handleDelete}
        icon={<Trash size={24} weight="bold" />}
        title={deleting && isIncome(deleting) ? 'Delete recurring income?' : 'Delete recurring payment?'}
        description={deleting && isIncome(deleting)
          ? 'No more deposits will be added. Income already logged stays in your history.'
          : 'No more payments will be added. Payments already logged stay in your history.'}
        confirmLabel="Delete"
      >
        {deleting && (
          <div className="flex items-center gap-3 rounded-[20px] p-3.5" style={{ background: '#fff', border: '1px solid var(--hairline)' }}>
            {isIncome(deleting)
              ? <IncomeIcon size={40} iconSize={20} radius={12} />
              : deleting.categories && <CategoryIcon icon={deleting.categories.icon} color={deleting.categories.color} bg_color={deleting.categories.bg_color} size={40} iconSize={20} radius={12} />}
            <div className="flex-1 min-w-0 text-left">
              <div className="text-row font-bold truncate" style={{ color: 'var(--ink)' }}>{deleting.note || deleting.categories?.name || (isIncome(deleting) ? 'Income' : 'Payment')}</div>
              <div className="text-meta font-medium mt-0.5 truncate" style={{ color: 'var(--muted)' }}>{FREQUENCY_LABEL[deleting.frequency]}</div>
            </div>
            <span className="text-row font-extrabold tabular-nums" style={{ color: isIncome(deleting) ? INCOME_COLOR : 'var(--ink)' }}>{signedAmount({ kind: deleting.kind, amount: Number(deleting.amount) })}</span>
          </div>
        )}
      </ConfirmSheet>
    </>
  )
}
