'use client'

import { useAppContext } from '@/features/common/queries'
import ShareButton from './ShareButton'
import HistoryHeaderSkeleton from './HistoryHeaderSkeleton'

// A tab in the bottom nav, so it's headed like Home rather than given a back button.
export default function HistoryHeader() {
  const { group } = useAppContext()
  if (!group) return <HistoryHeaderSkeleton />

  return (
    <div className="flex items-center justify-between px-5 pt-12 pb-1">
      <div className="min-w-0">
        <div className="text-meta font-medium truncate" style={{ color: 'var(--muted)' }}>{group.name} group</div>
        <h1 className="text-title font-extrabold tracking-tight" style={{ color: 'var(--ink)' }}>History</h1>
      </div>
      <ShareButton groupName={group.name} />
    </div>
  )
}
