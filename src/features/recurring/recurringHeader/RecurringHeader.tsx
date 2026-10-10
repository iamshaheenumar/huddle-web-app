import Link from 'next/link'
import { CaretLeft, Plus } from '@phosphor-icons/react/dist/ssr'

export default function RecurringHeader() {
  return (
    <div className="flex items-center justify-between px-5 pt-12 pb-0">
      <Link href="/dashboard" aria-label="Back" className="w-10 h-10 rounded-[13px] flex items-center justify-center" style={{ background: '#fff', border: '1px solid #EAE5DD', color: '#3A3F49' }}>
        <CaretLeft size={17} weight="bold" />
      </Link>
      <span className="text-[17px] font-extrabold" style={{ color: '#20242E' }}>Recurring</span>
      <Link href="/expense/add?recurring=1" aria-label="Add recurring payment" className="w-10 h-10 rounded-[13px] flex items-center justify-center text-white" style={{ background: '#3B6FF6', boxShadow: '0 10px 18px -8px rgba(59,111,246,.7)' }}>
        <Plus size={17} weight="bold" />
      </Link>
    </div>
  )
}
