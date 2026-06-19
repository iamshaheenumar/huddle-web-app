'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { House, ChartPieSlice, Plus, Users, UserCircle } from '@phosphor-icons/react'

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  const active = (path: string) => pathname === path || pathname.startsWith(path + '/')
  const color = (path: string) => active(path) ? '#3B6FF6' : '#B4B8C0'

  return (
    <div
      className="flex items-center justify-around px-5 pt-3"
      style={{
        background: '#fff',
        borderTop: '1px solid #F0ECE4',
        paddingBottom: 'env(safe-area-inset-bottom, 22px)',
        marginBottom: 0,
      }}
    >
      <Link href="/dashboard" className="flex flex-col items-center gap-1">
        <House size={24} weight={active('/dashboard') ? 'fill' : 'regular'} color={color('/dashboard')} />
        <span className="text-[10px] font-bold" style={{ color: color('/dashboard') }}>Home</span>
      </Link>

      <Link href="/budget/set" className="flex flex-col items-center gap-1">
        <ChartPieSlice size={24} weight={active('/budget') ? 'fill' : 'regular'} color={color('/budget')} />
        <span className="text-[10px] font-bold" style={{ color: color('/budget') }}>Budget</span>
      </Link>

      <button
        onClick={() => router.push('/expense/add')}
        className="w-13 h-13 rounded-full flex items-center justify-center -mt-6"
        style={{ background: '#3B6FF6', boxShadow: '0 12px 22px -8px rgba(59,111,246,.7)', width: 52, height: 52 }}
      >
        <Plus size={24} weight="bold" color="#fff" />
      </button>

      <Link href="/members" className="flex flex-col items-center gap-1">
        <Users size={24} weight={active('/members') ? 'fill' : 'regular'} color={color('/members')} />
        <span className="text-[10px] font-bold" style={{ color: color('/members') }}>Members</span>
      </Link>

      <Link href="/profile" className="flex flex-col items-center gap-1">
        <UserCircle size={24} weight={active('/profile') ? 'fill' : 'regular'} color={color('/profile')} />
        <span className="text-[10px] font-bold" style={{ color: color('/profile') }}>Profile</span>
      </Link>
    </div>
  )
}
