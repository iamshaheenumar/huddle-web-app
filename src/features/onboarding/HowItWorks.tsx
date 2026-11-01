import { Plus, UsersThree, Wallet } from '@phosphor-icons/react/dist/ssr'

const OWNER = [
  { Icon: Wallet, title: 'Set a monthly budget', body: 'Huddle turns it into what you can spend each day.' },
  { Icon: Plus, title: 'Log spending as it happens', body: "Today's number updates as soon as you add something." },
  { Icon: UsersThree, title: 'Share it with your group', body: 'Everyone sees the same numbers, live.' },
]

const MEMBER = [
  { Icon: Plus, title: 'Log what you spend', body: 'Amount, category, done. It works offline too.' },
  { Icon: Wallet, title: "Watch what's left today", body: 'Home shows what the group can still spend each day.' },
  { Icon: UsersThree, title: 'Everyone sees the same numbers', body: 'No more asking who paid for what.' },
]

// The three things to know about Huddle, shown once set-up starts (or, for
// someone who joined a group, once they're in).
export default function HowItWorks({ joined }: { joined?: boolean }) {
  return (
    <ul className="flex flex-col gap-[18px]">
      {(joined ? MEMBER : OWNER).map(({ Icon, title, body }) => (
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
  )
}
