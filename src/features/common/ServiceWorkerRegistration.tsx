'use client'

import { useEffect } from 'react'
import { clearOfflinePages } from '@/lib/query/client'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    if (process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
      return
    }
    // Dev chunk URLs aren't content-hashed, so the worker's cache-first static
    // caching would serve stale code. Remove any worker left from a prod run.
    navigator.serviceWorker.getRegistrations()
      .then(regs => Promise.all(regs.map(r => r.unregister())))
      .then(clearOfflinePages)
      .catch(() => {})
  }, [])

  return null
}
