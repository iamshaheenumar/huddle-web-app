'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useSession } from '@/lib/query/session'
import { useAppContext, useGroupMembers } from '@/features/common/queries'
import { useRecurring } from '@/features/recurring/queries'
import { useBudget, useSpendDay } from '../queries'

export type GettingStartedItem = { key: string; label: string; href?: string; done: boolean }

export type GettingStarted = {
  // On for new accounts until every item is done or it's hidden.
  visible: boolean
  // Still on, but every item is done: time to turn it off for good.
  finished: boolean
  items: GettingStartedItem[]
  // Anything logged yet, by anyone in the group.
  hasFirstEntry: boolean
  hide: () => void
}

// The checklist reads the group's own data rather than flags of its own, so it
// is right on every device and ticks itself off when someone else does a step.
// Only whether to show it lives on the account (`getting_started` in user
// metadata), set when set-up finishes or an invited account is created.
export function useGettingStarted(): GettingStarted | undefined {
  const queryClient = useQueryClient()
  const { data: user } = useSession()
  const { group } = useAppContext()
  const flagKey = ['gettingStarted', user?.id]
  const { data: flag } = useQuery({
    queryKey: flagKey,
    // From the locally stored session, like useSession: no network call.
    queryFn: async () => {
      const { data } = await createClient().auth.getSession()
      return data.session?.user.user_metadata?.getting_started === true
    },
    enabled: !!user,
    networkMode: 'always',
  })
  const budget = useBudget().data
  const day = useSpendDay()
  const members = useGroupMembers().data
  const recurring = useRecurring()

  if (flag === undefined || !group || budget === undefined || !day || !members || !recurring) return undefined

  const hasFirstEntry = day.date !== null
  const items: GettingStartedItem[] = [
    { key: 'group', label: `Set up ${group.name}`, done: true },
    { key: 'budget', label: 'Set a monthly budget', href: '/budget/set', done: budget !== null },
    { key: 'expense', label: 'Add your first expense', href: '/expense/add', done: hasFirstEntry },
    { key: 'invite', label: 'Invite someone', href: '/members/invite', done: members.length > 1 },
    { key: 'recurring', label: 'Add a fixed bill, like rent', href: '/expense/add?recurring=1', done: recurring.length > 0 },
  ]

  function hide() {
    queryClient.setQueryData(flagKey, false)
    // Offline this doesn't stick, so the card can come back on another device
    // until it's hidden once online.
    createClient().auth.updateUser({ data: { getting_started: false } }).catch(() => {})
  }

  const allDone = items.every(i => i.done)
  return { visible: flag && !allDone, finished: flag && allDone, items, hasFirstEntry, hide }
}
