'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutationState, useQueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { makeQueryClient, createPersister, CACHE_MAX_AGE, CACHE_BUSTER, resumeQueuedWrites } from '@/lib/query/client'
import { useSession } from '@/lib/query/session'
import { useOnline } from '@/lib/query/online'

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient)
  const [persister] = useState(() => createPersister(queryClient))

  // Signed in now, so the service worker can store the app shells for offline use.
  useEffect(() => {
    navigator.serviceWorker?.ready.then(reg => reg.active?.postMessage('precache-shells')).catch(() => {})
  }, [])

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: CACHE_MAX_AGE, buster: CACHE_BUSTER }}
      onSuccess={() => resumeQueuedWrites(queryClient)}
    >
      <SessionGuard />
      <OfflineBanner />
      <SyncErrorBanner />
      {children}
    </PersistQueryClientProvider>
  )
}

// The proxy guards server requests; this covers a session that ends while the
// app shell is served from cache.
function SessionGuard() {
  const router = useRouter()
  const { data: user } = useSession()
  useEffect(() => {
    if (user === null) router.replace('/login')
  }, [user, router])
  return null
}

// Queued expense writes run after their screen is gone, so a write the server
// rejects (after retries) is reported here instead of vanishing silently.
function SyncErrorBanner() {
  const queryClient = useQueryClient()
  const failed = useMutationState({ filters: { mutationKey: ['expense'], status: 'error' } })
  if (failed.length === 0) return null

  function dismiss() {
    const cache = queryClient.getMutationCache()
    cache.findAll({ mutationKey: ['expense'], status: 'error' }).forEach(m => cache.remove(m))
  }

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 rounded-2xl px-4 py-3 text-[13px] font-bold text-white" style={{ width: 'calc(100% - 40px)', maxWidth: 390, background: '#E0563E' }}>
      <span className="flex-1">{failed.length === 1 ? 'A change' : `${failed.length} changes`} couldn&apos;t be saved.</span>
      <button onClick={dismiss} className="underline">Dismiss</button>
    </div>
  )
}

function OfflineBanner() {
  const online = useOnline()
  if (online) return null
  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full z-30 px-4 pb-1.5 text-center text-[12px] font-bold text-white" style={{ maxWidth: 430, background: '#20242E', paddingTop: 'calc(env(safe-area-inset-top) + 6px)' }}>
      You&apos;re offline · showing saved data
    </div>
  )
}
