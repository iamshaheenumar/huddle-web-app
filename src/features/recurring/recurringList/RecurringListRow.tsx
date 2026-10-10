'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash } from '@phosphor-icons/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import CategoryIcon from '@/features/common/CategoryIcon'
import SyncingBadge from '@/features/common/SyncingBadge'
import Toggle from '@/features/common/Toggle'
import { fmt } from '@/lib/format'
import { persistNow } from '@/lib/query/client'
import { TOGGLE_RECURRING, type RecurringToggle } from '@/lib/query/mutations'
import { FREQUENCY_LABEL, shortDate } from '@/lib/recurring'
import { isRunning, type RecurringRow } from '../queries'

// Width of the Delete action revealed by swiping a row left.
const ACTION_WIDTH = 84

type Props = {
  row: RecurringRow
  isLast: boolean
  // Whether the Delete action is revealed. Only one row is open at a time.
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete: () => void
}

type Drag = { x: number; y: number; base: number; active: boolean }

export default function RecurringListRow({ row, isLast, open, onOpenChange, onDelete }: Props) {
  const router = useRouter()
  const queryClient = useQueryClient()
  // Queued like expense writes (src/lib/query/mutations.ts), so it works offline.
  const toggle = useMutation<void, Error, RecurringToggle>({ mutationKey: TOGGLE_RECURRING })

  const drag = useRef<Drag | null>(null)
  // Set by a swipe so the click that ends it doesn't also open the row.
  const swiped = useRef(false)
  const [dragOffset, setDragOffset] = useState<number | null>(null)
  const offset = dragOffset ?? (open ? -ACTION_WIDTH : 0)

  const running = isRunning(row)
  const ended = row.is_active && !row.next_due_date
  const title = row.note || row.categories?.name || 'Payment'
  const status = running ? `due ${shortDate(row.next_due_date!)}` : ended ? 'ended' : 'paused'

  function onPointerDown(e: React.PointerEvent) {
    drag.current = { x: e.clientX, y: e.clientY, base: open ? -ACTION_WIDTH : 0, active: false }
    swiped.current = false
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (!d.active) {
      // Vertical movement is a scroll: stop tracking this gesture.
      if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { drag.current = null; return }
      if (Math.abs(dx) < 8) return
      d.active = true
      swiped.current = true
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    setDragOffset(Math.max(-ACTION_WIDTH, Math.min(0, d.base + dx)))
  }

  function onPointerEnd() {
    if (drag.current?.active && dragOffset !== null) onOpenChange(dragOffset < -ACTION_WIDTH / 2)
    drag.current = null
    setDragOffset(null)
  }

  function openRow() {
    if (swiped.current) { swiped.current = false; return }
    if (open) { onOpenChange(false); return }
    router.push(`/recurring/${row.id}`)
  }

  function setActive(is_active: boolean) {
    toggle.mutate({ id: row.id, is_active })
    persistNow(queryClient)
  }

  return (
    <div className="relative overflow-hidden">
      <button
        type="button"
        onClick={onDelete}
        tabIndex={open ? 0 : -1}
        aria-hidden={!open}
        className="absolute top-0 right-0 bottom-0 flex flex-col items-center justify-center gap-[3px] text-white"
        style={{ width: ACTION_WIDTH, background: '#E5483E' }}
      >
        <Trash size={18} weight="bold" />
        <span className="text-[11px] font-extrabold">Delete</span>
      </button>

      <div
        role="link"
        tabIndex={0}
        aria-label={`Edit ${title}`}
        onClick={openRow}
        onKeyDown={e => { if (e.key === 'Enter') openRow() }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        className="relative px-4 cursor-pointer select-none"
        style={{
          background: '#fff',
          touchAction: 'pan-y',
          transform: `translateX(${offset}px)`,
          transition: dragOffset === null ? 'transform .2s ease' : 'none',
          boxShadow: offset < 0 ? '6px 0 10px -6px rgba(32,36,46,.18)' : 'none',
        }}
      >
        <div className="flex items-center gap-3 py-[13px]" style={{ borderBottom: isLast ? 'none' : '1px solid #F4F0E9' }}>
          {running && row.categories
            ? <CategoryIcon icon={row.categories.icon} color={row.categories.color} bg_color={row.categories.bg_color} size={36} iconSize={18} radius={11} />
            : <CategoryIcon icon={row.categories?.icon ?? ''} color="#9A9FA8" bg_color="#F2EFEA" size={36} iconSize={18} radius={11} />}
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-bold truncate" style={{ color: running ? '#2A2E37' : '#9A9FA8' }}>{title}</div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[11px] font-semibold truncate" style={{ color: '#9A9FA8' }}>
                {FREQUENCY_LABEL[row.frequency]} · {status}
              </span>
              {row.pending && <SyncingBadge />}
            </div>
          </div>
          <div className="flex flex-col items-end gap-[5px]">
            <span className="text-[14px] font-extrabold tabular-nums" style={{ color: running ? '#20242E' : '#B4B8C0' }}>−{fmt(Number(row.amount))}</span>
            <Toggle
              size="sm"
              checked={running}
              disabled={ended}
              onChange={setActive}
              label={running ? `Pause ${title}` : `Resume ${title}`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
