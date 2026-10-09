'use client'

import { usePathname } from 'next/navigation'
import { hidesBottomNav } from './navPaths'

// The scrolling page area; reserves room for the bottom nav only where it shows.
export default function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="flex-1 overflow-y-auto" style={{ paddingBottom: hidesBottomNav(pathname) ? 0 : 80, paddingTop: 'env(safe-area-inset-top)' }}>
      {children}
    </div>
  )
}
