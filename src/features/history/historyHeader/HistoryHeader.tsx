'use client'

import Link from 'next/link'
import { ArrowsLeftRight } from '@phosphor-icons/react'
import { useAppContext } from '@/features/common/queries'
import { compareHref } from '../links'
import ShareButton from './ShareButton'
import HistoryHeaderSkeleton from './HistoryHeaderSkeleton'

// A tab in the bottom nav, so it's headed like Home rather than given a back button.
export default function HistoryHeader({ period }: { period?: string }) {
  const { group } = useAppContext()
  if (!group) return <HistoryHeaderSkeleton />

  return (
    <div className="flex items-center justify-between px-5 pt-12 pb-1">
      <div className="min-w-0">
        <div className="text-meta font-medium truncate" style={{ color: 'var(--muted)' }}>{group.name} group</div>
        <h1 className="text-title font-extrabold tracking-tight" style={{ color: 'var(--ink)' }}>History</h1>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href={compareHref(period)}
          aria-label="Compare months"
          className="w-11 h-11 rounded-[14px] flex items-center justify-center"
          style={{ background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--ink)' }}
        >
          <ArrowsLeftRight size={17} weight="bold" />
        </Link>
        <ShareButton groupName={group.name} />
      </div>
    </div>
  )
}
