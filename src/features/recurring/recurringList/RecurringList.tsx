'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { Trash } from '@phosphor-icons/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import CategoryIcon from '@/features/common/CategoryIcon'
import ConfirmSheet from '@/features/common/ConfirmSheet'
import { fmt } from '@/lib/format'
import { persistNow } from '@/lib/query/client'
import { DELETE_RECURRING, type RecurringDelete } from '@/lib/query/mutations'
import { FREQUENCY_LABEL } from '@/lib/recurring'
import type { RecurringRow } from '../queries'
import RecurringListRow from './RecurringListRow'

export type RecurringFilter = 'all' | 'active' | 'paused'

const EMPTY_TEXT: Record<RecurringFilter, string> = {
  all: 'No recurring payments yet.',
  active: 'No recurring payments are running.',
  paused: 'No paused payments.',
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
        <span className="text-[16px] font-extrabold" style={{ color: '#20242E' }}>Upcoming</span>
        <span className="text-[12px] font-bold" style={{ color: '#9A9FA8' }}>Sorted by due date</span>
      </div>
      <div className="mx-5 mt-3 rounded-[20px] py-1 overflow-hidden" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
        {rows.length === 0 ? (
          <div className="py-[22px] px-4 text-center text-[14px] font-semibold" style={{ color: '#9A9FA8' }}>
            {EMPTY_TEXT[filter]}
            {filter === 'all' && (
              <> <Link href="/expense/add?recurring=1" className="font-bold" style={{ color: '#3B6FF6' }}>Add one</Link></>
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
        <p className="px-6 pt-2.5 text-[11px] font-semibold" style={{ color: '#B4B8C0' }}>Swipe left to delete · tap to edit</p>
      )}

      <ConfirmSheet
        open={deleting !== null}
        onClose={closeConfirm}
        onConfirm={handleDelete}
        icon={<Trash size={24} weight="bold" />}
        title="Delete recurring payment?"
        description="No more payments will be added. Payments already logged stay in your history."
        confirmLabel="Delete"
      >
        {deleting && (
          <div className="flex items-center gap-3 rounded-[20px] p-3.5" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
            {deleting.categories && <CategoryIcon icon={deleting.categories.icon} color={deleting.categories.color} bg_color={deleting.categories.bg_color} size={40} iconSize={20} radius={12} />}
            <div className="flex-1 min-w-0 text-left">
              <div className="text-[15px] font-bold truncate" style={{ color: '#20242E' }}>{deleting.note || deleting.categories?.name || 'Payment'}</div>
              <div className="text-[12px] font-semibold mt-0.5 truncate" style={{ color: '#9A9FA8' }}>{FREQUENCY_LABEL[deleting.frequency]}</div>
            </div>
            <span className="text-[16px] font-extrabold tabular-nums" style={{ color: '#20242E' }}>−{fmt(Number(deleting.amount))}</span>
          </div>
        )}
      </ConfirmSheet>
    </>
  )
}
