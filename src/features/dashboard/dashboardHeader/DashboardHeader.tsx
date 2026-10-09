'use client'

import Greeting from '@/features/common/Greeting'
import GroupSwitcher from '@/features/common/GroupSwitcher'
import { useAppContext, useProfile, useGroups } from '@/features/common/queries'
import DashboardHeaderSkeleton from './DashboardHeaderSkeleton'

export default function DashboardHeader() {
  const { group } = useAppContext()
  const { data: profile } = useProfile()
  const { data: groups } = useGroups()
  if (!group || profile === undefined || !groups) return <DashboardHeaderSkeleton />

  const displayName = profile?.display_name ?? 'there'
  const avatarColor = profile?.avatar_color ?? '#3B6FF6'

  return (
    <div className="flex items-center justify-between px-5 pt-12">
      <div>
        <Greeting name={displayName} />
        <GroupSwitcher currentGroup={group} groups={groups} />
      </div>
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center font-extrabold text-base text-white"
        style={{ background: avatarColor, boxShadow: '0 6px 14px -6px rgba(59,111,246,.7)' }}
      >
        {displayName.charAt(0).toUpperCase()}
      </div>
    </div>
  )
}
