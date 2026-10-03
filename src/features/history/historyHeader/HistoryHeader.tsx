import Link from 'next/link'
import { getHistoryContext } from '../data'
import ShareButton from './ShareButton'

export default async function HistoryHeader({ period }: { period?: string }) {
  const { group } = await getHistoryContext(period)

  return (
    <div className="flex items-center justify-between px-5 pt-12 pb-1">
      <Link href="/dashboard" className="w-10 h-10 rounded-[13px] flex items-center justify-center" style={{ background: '#fff', border: '1px solid #EAE5DD', color: '#3A3F49' }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
      </Link>
      <div className="flex flex-col items-center">
        <span className="text-[12px] font-semibold" style={{ color: '#9A9FA8' }}>{group.name} group</span>
        <span className="text-[17px] font-extrabold" style={{ color: '#20242E' }}>Spending history</span>
      </div>
      <ShareButton groupName={group.name} />
    </div>
  )
}
