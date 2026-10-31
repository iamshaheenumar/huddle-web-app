import Link from 'next/link'
import { ArrowsCounterClockwise, Plus, UsersThree } from '@phosphor-icons/react/dist/ssr'
import HuddleMark from '@/features/common/HuddleMark'

const POINTS = [
  { Icon: ArrowsCounterClockwise, title: 'Set a monthly budget', body: "Split it into categories and see what's left each day." },
  { Icon: Plus, title: 'Log spending in seconds', body: 'Amount, category, who paid. Works offline too.' },
  { Icon: UsersThree, title: 'Share it with your group', body: 'Everyone sees the same numbers as they happen.' },
]

// First screen for someone signed out: what Huddle is, then sign up or sign in.
export default function Welcome() {
  return (
    <div className="min-h-screen flex justify-center" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-[430px] flex flex-col px-6 pt-16 pb-[calc(env(safe-area-inset-bottom)+32px)]">
        <HuddleMark size={72} shadow />

        <h1 className="mt-7 text-figure font-extrabold tracking-tight leading-[1.15]" style={{ color: 'var(--ink)' }}>
          One budget for everyone you share money with.
        </h1>
        <p className="mt-3 text-row font-medium leading-normal" style={{ color: 'var(--ink-2)' }}>
          Huddle keeps your home or office spending in one place, so nobody has to ask who paid for what.
        </p>

        <ul className="mt-9 flex flex-col gap-[18px]">
          {POINTS.map(({ Icon, title, body }) => (
            <li key={title} className="flex gap-3.5 items-start">
              <span className="w-10 h-10 shrink-0 rounded-[12px] flex items-center justify-center" style={{ background: 'var(--primary-soft)', color: 'var(--primary-text)' }}>
                <Icon size={20} weight="bold" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-row font-bold" style={{ color: 'var(--ink)' }}>{title}</span>
                <span className="block text-body font-medium mt-0.5" style={{ color: 'var(--muted)' }}>{body}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="flex-1 min-h-10" />

        <Link href="/signup" className="flex items-center justify-center min-h-14 rounded-[17px] text-row font-extrabold text-white" style={{ background: 'var(--primary)' }}>
          Create an account
        </Link>
        <Link href="/login" className="mt-2 flex items-center justify-center min-h-12 rounded-[17px] text-row font-bold" style={{ color: 'var(--primary-text)' }}>
          I already have an account
        </Link>
      </div>
    </div>
  )
}
