import Link from 'next/link'
import MemberAvatar from '@/features/common/MemberAvatar'
import { fmt } from '@/lib/format'
import { getMembers } from '../data'

export default async function MembersSection() {
  const members = await getMembers()
  if (members.length === 0) return null

  return (
    <>
      <div className="flex items-center justify-between px-5 pt-5">
        <span className="text-base font-extrabold" style={{ color: '#20242E' }}>Members</span>
        <Link href="/members" className="text-[12px] font-bold" style={{ color: '#3B6FF6' }}>See all</Link>
      </div>
      <div className="flex gap-2.5 px-5 mt-3">
        {members.slice(0, 4).map(m => (
          <div key={m.user_id} className="flex-1 rounded-[18px] p-3 text-center" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
            <MemberAvatar name={m.profile?.display_name ?? '?'} color={m.profile?.avatar_color ?? '#3B6FF6'} size={38} />
            <div className="text-[12px] font-bold mt-2" style={{ color: '#3A3F49' }}>{m.profile?.display_name?.split(' ')[0]}</div>
            <div className="text-[13px] font-extrabold mt-0.5" style={{ color: '#20242E' }}>{fmt(m.spent)}</div>
          </div>
        ))}
      </div>
    </>
  )
}
