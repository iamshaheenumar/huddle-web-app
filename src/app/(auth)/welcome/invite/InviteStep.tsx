'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import StepHeader from '@/features/onboarding/StepHeader'
import { finishOnboarding } from '@/features/onboarding/finish'
import InviteCard from '@/features/members/inviteCard/InviteCard'
import type { GroupSummary } from '@/lib/group'

export default function InviteStep({ group, code }: { group: GroupSummary; code: string }) {
  const router = useRouter()
  const [shared, setShared] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDone() {
    setLoading(true)
    await finishOnboarding()
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex justify-center" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-[430px] flex flex-col px-5 pt-12 pb-[calc(env(safe-area-inset-bottom)+32px)]">
        <StepHeader step={4} backHref="/welcome/budget" />

        <h1 className="mt-7 text-title font-extrabold tracking-tight" style={{ color: 'var(--ink)' }}>Who else is in {group.name}?</h1>
        <p className="mt-1.5 text-body font-medium leading-normal" style={{ color: 'var(--ink-2)' }}>
          Send them the link. They&apos;ll see the budget and add their own spending.
        </p>

        {/* The card brings its own side margins, so it spans the column like on the Group tab. */}
        <div className="-mx-5 -mt-1">
          <InviteCard code={code} groupId={group.id} onShared={() => setShared(true)} />
        </div>
        <p className="mt-3 text-meta font-medium leading-normal" style={{ color: 'var(--muted)' }}>
          You can invite people any time from the Group tab.
        </p>

        <div className="flex-1 min-h-8" />

        {shared ? (
          <button
            type="button"
            onClick={handleDone}
            disabled={loading}
            className="w-full min-h-14 rounded-[17px] text-row font-extrabold text-white disabled:cursor-not-allowed"
            style={{ background: 'var(--primary)', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Opening Home…' : 'Go to Home'}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleDone}
            disabled={loading}
            className="w-full min-h-14 rounded-[17px] text-row font-extrabold disabled:opacity-60"
            style={{ background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--ink)' }}
          >
            {loading ? 'Opening Home…' : 'Just me for now'}
          </button>
        )}
      </div>
    </div>
  )
}
