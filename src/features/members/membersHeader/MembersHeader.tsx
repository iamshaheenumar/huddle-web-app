import Link from 'next/link'
import { getMembersContext, getMembers } from '../data'

export default async function MembersHeader() {
  const [{ group }, members] = await Promise.all([getMembersContext(), getMembers()])

  return (
    <div className="flex items-center justify-between px-5 pt-12 pb-0">
      <div>
        <div className="text-[13px] font-semibold" style={{ color: '#9A9FA8' }}>Group</div>
        <div className="flex items-center gap-2 mt-0.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#3B6FF6"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          <span className="text-[20px] font-extrabold" style={{ color: '#20242E' }}>{group.name}</span>
          <span className="text-[12px] font-bold" style={{ color: '#9A9FA8' }}>· {members.length} members</span>
        </div>
      </div>
      <Link href="/members/invite" className="flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-bold" style={{ background: '#fff', border: '1px solid #EAE5DD', color: '#3B6FF6' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
        Invite
      </Link>
    </div>
  )
}
