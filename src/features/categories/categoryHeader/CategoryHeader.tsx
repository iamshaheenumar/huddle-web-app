'use client'

import Link from 'next/link'
import CategoryIcon from '@/features/common/CategoryIcon'
import { useCategoryDetail } from '../queries'
import CategoryHeaderSkeleton from './CategoryHeaderSkeleton'

export default function CategoryHeader({ id }: { id: string }) {
  const category = useCategoryDetail(id)?.category
  if (!category) return <CategoryHeaderSkeleton />

  return (
    <div className="flex items-center justify-between px-5 pt-12 pb-0">
      <Link href="/dashboard" aria-label="Back to home" className="w-11 h-11 rounded-[14px] flex items-center justify-center" style={{ background: '#fff', border: '1px solid #EAE5DD', color: '#3A3F49' }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </Link>
      <div className="flex items-center gap-2.5">
        <CategoryIcon icon={category.icon} color={category.color} bg_color={category.bg_color} size={30} iconSize={16} radius={9} />
        <span className="text-[17px] font-extrabold" style={{ color: '#20242E' }}>{category.name}</span>
      </div>
      <Link href="/budget/set" aria-label="Edit budget" className="w-11 h-11 rounded-[14px] flex items-center justify-center" style={{ background: '#fff', border: '1px solid #EAE5DD', color: '#3A3F49' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
      </Link>
    </div>
  )
}
