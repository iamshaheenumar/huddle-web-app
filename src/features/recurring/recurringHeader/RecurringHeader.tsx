import Link from 'next/link'
import { CaretLeft, Plus } from '@phosphor-icons/react/dist/ssr'

export default function RecurringHeader() {
  return (
    <div className="flex items-center justify-between px-5 pt-12 pb-0">
      <Link href="/dashboard" aria-label="Back" className="w-11 h-11 rounded-[14px] flex items-center justify-center" style={{ background: '#fff', border: '1px solid var(--line)', color: 'var(--ink)' }}>
        <CaretLeft size={17} weight="bold" />
      </Link>
      <span className="text-[17px] font-extrabold" style={{ color: 'var(--ink)' }}>Recurring</span>
      <Link href="/expense/add?recurring=1" aria-label="Add recurring payment or income" className="w-11 h-11 rounded-[14px] flex items-center justify-center text-white" style={{ background: 'var(--primary)', boxShadow: '0 10px 18px -8px rgba(59,111,246,.7)' }}>
        <Plus size={17} weight="bold" />
      </Link>
    </div>
  )
}
