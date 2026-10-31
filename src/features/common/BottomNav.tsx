'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { House, ChartBar, Plus, UsersThree, UserCircle } from '@phosphor-icons/react'
import { hidesBottomNav } from './navPaths'

// History gets a tab because it's the screen people come back to; the budget
// editor is reached from Home ("Edit budget", "Set budget").
const TABS = [
  { href: '/dashboard', label: 'Home', Icon: House },
  { href: '/history', label: 'History', Icon: ChartBar },
  { href: '/members', label: 'Group', Icon: UsersThree },
  { href: '/profile', label: 'You', Icon: UserCircle },
] as const

export default function BottomNav() {
  const pathname = usePathname()
  if (hidesBottomNav(pathname)) return null

  const active = (path: string) => pathname === path || pathname.startsWith(path + '/')

  const tab = ({ href, label, Icon }: (typeof TABS)[number]) => (
    <Link
      key={href}
      href={href}
      aria-current={active(href) ? 'page' : undefined}
      className="flex flex-col items-center justify-center gap-1 min-w-14 min-h-11"
      // Icons default to currentColor, so this colours both icon and label.
      style={{ color: active(href) ? 'var(--primary-text)' : 'var(--muted)' }}
    >
      <Icon size={24} weight={active(href) ? 'fill' : 'regular'} />
      <span className="text-label font-bold">{label}</span>
    </Link>
  )

  return (
    <nav
      aria-label="Main"
      className="flex items-center justify-around px-3 pt-2"
      style={{
        background: 'var(--card)',
        borderTop: '1px solid var(--hairline)',
        paddingBottom: 'env(safe-area-inset-bottom, 22px)',
        marginBottom: 0,
      }}
    >
      {TABS.slice(0, 2).map(tab)}

      <Link
        href="/expense/add"
        aria-label="Add transaction"
        className="rounded-full flex items-center justify-center -mt-6"
        style={{ background: 'var(--primary)', boxShadow: '0 8px 16px -8px rgba(32,36,46,.45)', width: 56, height: 56 }}
      >
        <Plus size={26} weight="bold" color="#fff" />
      </Link>

      {TABS.slice(2).map(tab)}
    </nav>
  )
}
