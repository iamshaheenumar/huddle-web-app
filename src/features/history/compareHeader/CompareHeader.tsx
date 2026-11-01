import Link from 'next/link'
import { CaretLeft } from '@phosphor-icons/react/dist/ssr'
import { historyHref } from '../links'

// Back returns to History on month a, where the compare button was tapped.
export default function CompareHeader({ a }: { a?: string }) {
  return (
    <div className="flex items-center justify-between px-5 pt-12 pb-0">
      <Link href={historyHref(a, 'transactions')} aria-label="Back to history" className="w-11 h-11 rounded-[14px] flex items-center justify-center" style={{ background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--ink)' }}>
        <CaretLeft size={17} weight="bold" />
      </Link>
      <h1 className="text-section font-extrabold" style={{ color: 'var(--ink)' }}>Compare months</h1>
      <div className="w-11 h-11" aria-hidden="true" />
    </div>
  )
}
