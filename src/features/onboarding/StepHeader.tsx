import Link from 'next/link'
import { CaretLeft } from '@phosphor-icons/react/dist/ssr'

const STEPS = 4

// Progress for account (sign up and confirm) → group → budget → invite, with an
// optional back link.
export default function StepHeader({ step, backHref }: { step: number; backHref?: string }) {
  return (
    <div className="flex items-center gap-3">
      {backHref ? (
        <Link
          href={backHref}
          aria-label="Back"
          className="w-11 h-11 shrink-0 rounded-[14px] flex items-center justify-center"
          style={{ background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--ink)' }}
        >
          <CaretLeft size={17} weight="bold" />
        </Link>
      ) : (
        <div className="w-11 h-11 shrink-0" aria-hidden="true" />
      )}
      <div
        className="flex-1 grid grid-cols-4 gap-1.5"
        role="progressbar"
        aria-label="Set-up progress"
        aria-valuemin={1}
        aria-valuemax={STEPS}
        aria-valuenow={step}
      >
        {Array.from({ length: STEPS }, (_, i) => (
          <div key={i} className="h-1 rounded-full" style={{ background: i < step ? 'var(--primary)' : 'var(--line)' }} />
        ))}
      </div>
      <span className="text-meta font-medium" style={{ color: 'var(--muted)' }}>{step} of {STEPS}</span>
    </div>
  )
}
