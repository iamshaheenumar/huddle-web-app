import { QueryClient, dehydrate, type Mutation } from '@tanstack/react-query'
import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client'
import { get, set, del } from 'idb-keyval'
import { registerMutationDefaults } from './mutations'

// How long cached data survives in IndexedDB (and in memory) without being used.
export const CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000
// Bump when a cached query's data shape changes; a mismatch discards the stored cache.
export const CACHE_BUSTER = 'v1'
export const PERSIST_KEY = 'huddle-query-cache'

export function makeQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Cached data renders instantly; anything older than this refetches in the background.
        staleTime: 30_000,
        gcTime: CACHE_MAX_AGE,
        retry: 2,
      },
    },
  })
  registerMutationDefaults(queryClient)
  return queryClient
}

// Persist every unfinished write, not just paused ones (the default), so a write
// still in flight when the app closes is retried on next launch.
export const shouldDehydrateMutation = (mutation: Mutation) => mutation.state.status === 'pending'

// Writes a snapshot of the cache as it is right now.
async function save(queryClient: QueryClient) {
  const client: PersistedClient = { buster: CACHE_BUSTER, timestamp: Date.now(), clientState: dehydrate(queryClient, { shouldDehydrateMutation }) }
  await set(PERSIST_KEY, JSON.stringify(client)).catch(() => {})
}

// Saves at most once a second, snapshotting when the save runs rather than when
// it was scheduled (unlike the stock async-storage persister). A save scheduled
// before a write was queued therefore can't overwrite it with an older cache.
export function createPersister(queryClient: QueryClient): Persister {
  let timer: ReturnType<typeof setTimeout> | null = null
  return {
    persistClient: () => {
      timer ??= setTimeout(() => { timer = null; void save(queryClient) }, 1000)
    },
    restoreClient: async () => {
      const raw = await get<string>(PERSIST_KEY)
      return raw ? (JSON.parse(raw) as PersistedClient) : undefined
    },
    removeClient: () => del(PERSIST_KEY),
  }
}

// Saves right away. Call after queueing a write: offline, the next navigation
// can fall back to a full page load, which would otherwise drop the write.
export const persistNow = save

// Restarts writes restored from storage. resumePausedMutations() alone would
// skip the ones that were mid-flight rather than paused; offline, they pause again.
export function resumeQueuedWrites(queryClient: QueryClient) {
  for (const mutation of queryClient.getMutationCache().getAll()) {
    if (mutation.state.status === 'pending') mutation.continue().catch(() => {})
  }
}

// Wipes the persisted cache. Call on sign-in/sign-out so one user's data never
// lingers on a shared device.
export async function clearPersistedCache() {
  await del(PERSIST_KEY).catch(() => {})
}

// Drops the service worker's caches (public/sw.js), which include page HTML.
export async function clearOfflinePages() {
  if (typeof caches === 'undefined') return
  const keys = await caches.keys()
  await Promise.all(keys.filter(k => k.startsWith('huddle-')).map(k => caches.delete(k)))
}
