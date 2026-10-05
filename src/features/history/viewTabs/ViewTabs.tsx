import Link from 'next/link'
import { historyHref } from '../links'
import type { HistoryView } from '../types'

const TABS: { view: HistoryView; label: string }[] = [
  { view: 'transactions', label: 'Transactions' },
  { view: 'categories', label: 'Categories' },
  { view: 'members', label: 'Members' },
]

export default function ViewTabs({ period, view }: { period?: string; view: HistoryView }) {
  return (
    <div className="flex mx-5 mt-5 rounded-full p-1" style={{ background: '#fff', border: '1px solid #EAE5DD' }}>
      {TABS.map(t => {
        const active = t.view === view
        return (
          <Link
            key={t.view}
            href={historyHref(period, t.view)}
            scroll={false}
            replace
            className="flex-1 rounded-full py-2 text-center text-[13px] font-bold"
            style={active ? { background: '#20242E', color: '#fff' } : { color: '#6B7079' }}
          >
            {t.label}
          </Link>
        )
      })}
    </div>
  )
}
