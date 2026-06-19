import Greeting from '@/features/common/Greeting'
import GroupSwitcher from '@/features/common/GroupSwitcher'
import { getDashboardContext, getProfile, getGroups } from '../data'

export default async function DashboardHeader() {
  const [{ group }, profile, groups] = await Promise.all([
    getDashboardContext(),
    getProfile(),
    getGroups(),
  ])

  const displayName = profile?.display_name ?? 'there'
  const avatarColor = profile?.avatar_color ?? '#3B6FF6'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="flex items-center justify-between px-5 pt-12">
      <div>
        <Greeting name={displayName} initial={greeting} />
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
