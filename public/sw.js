const CACHE_NAME = 'huddle-v2'

// Pages that must never be served from cache (auth flows, redirects).
const NO_CACHE_PREFIXES = ['/login', '/signup', '/join', '/auth']

// Static app shells that should open offline even before they're first visited.
const SHELLS = ['/dashboard', '/expense/add']

// Stores each shell only if it comes back as itself — signed out, the proxy
// redirects to /login, which must not be stored.
function precacheShells() {
  return caches.open(CACHE_NAME).then((cache) =>
    Promise.all(
      SHELLS.map((path) =>
        fetch(path)
          .then((response) => {
            if (response.ok && !response.redirected) return cache.put(path, response)
          })
          .catch(() => {})
      )
    )
  )
}

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(precacheShells())
})

// Sent by the app once signed in, since an install while signed out caches nothing.
self.addEventListener('message', (event) => {
  if (event.data === 'precache-shells') event.waitUntil(precacheShells())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  )
})

function cacheFirst(request) {
  return caches.match(request).then(
    (cached) =>
      cached ??
      fetch(request).then((response) => {
        const clone = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        return response
      })
  )
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET') return
  // Supabase and other cross-origin calls are cached by the client query layer.
  if (url.origin !== self.location.origin) return

  // Next.js static build output — cache aggressively (content-hashed filenames)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request))
    return
  }

  // App icons — cache after first fetch
  if (url.pathname.startsWith('/icon') || url.pathname.startsWith('/apple-icon')) {
    event.respondWith(cacheFirst(request))
    return
  }

  // Page loads — network first, keep the latest copy of each app page for offline.
  // In-app (RSC) navigations aren't intercepted: when they fail offline, Next
  // falls back to a full page load, which lands here.
  if (request.mode === 'navigate') {
    const cacheable = !NO_CACHE_PREFIXES.some((p) => url.pathname.startsWith(p))
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (cacheable && response.ok && !response.redirected) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(url.pathname, clone))
          }
          return response
        })
        .catch(() =>
          caches.match(url.pathname).then((cached) => cached ?? caches.match('/dashboard'))
        )
    )
    return
  }
})
