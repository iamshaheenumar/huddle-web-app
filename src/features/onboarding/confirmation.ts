'use client'

import { useSyncExternalStore } from 'react'
import { createClient } from '@/lib/supabase/client'

// Where a fresh account lands after tapping its confirmation link. A `next`
// (e.g. an invite page) skips the setup screens and goes straight there.
export const CONFIRMED_PATH = '/welcome/confirmed'

export function confirmRedirectTo(next?: string) {
  return `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next ?? CONFIRMED_PATH)}`
}

// The address the last confirmation link went to, kept on this device so the
// inbox and expired-link screens can show it and resend without asking again.
// Storage can be unavailable (private mode), so every access is guarded.
const KEY = 'huddle:pending-email'

export function savePendingEmail(email: string) {
  try { localStorage.setItem(KEY, email) } catch {}
}

export function readPendingEmail(): string {
  try { return localStorage.getItem(KEY) ?? '' } catch { return '' }
}

export function clearPendingEmail() {
  try { localStorage.removeItem(KEY) } catch {}
}

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange)
  return () => window.removeEventListener('storage', onChange)
}

// The saved address as a React value: empty on the server and the first
// client render (so hydration matches), then the stored one.
export function usePendingEmail(): string {
  return useSyncExternalStore(subscribe, readPendingEmail, () => '')
}

// Sends the signup confirmation email again. Returns a message to show, or null.
export async function resendConfirmation(email: string, next?: string): Promise<string | null> {
  const { error } = await createClient().auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: confirmRedirectTo(next) },
  })
  if (!error) return null
  if (error.code === 'over_email_send_rate_limit' || error.status === 429) {
    return 'Too many emails just now. Try again in a minute.'
  }
  return error.message
}

// Webmail inbox for the common providers, so "Open Gmail" can sit on the
// check-your-inbox screen; null when we can't tell.
const INBOXES: { domains: string[]; label: string; url: string }[] = [
  { domains: ['gmail.com', 'googlemail.com'], label: 'Open Gmail', url: 'https://mail.google.com/mail/u/0/#inbox' },
  { domains: ['outlook.com', 'hotmail.com', 'live.com', 'msn.com'], label: 'Open Outlook', url: 'https://outlook.live.com/mail/0/' },
  { domains: ['icloud.com', 'me.com', 'mac.com'], label: 'Open iCloud Mail', url: 'https://www.icloud.com/mail' },
  { domains: ['yahoo.com', 'ymail.com'], label: 'Open Yahoo Mail', url: 'https://mail.yahoo.com' },
]

export function inboxFor(email: string) {
  const domain = email.split('@')[1]?.toLowerCase() ?? ''
  return INBOXES.find(i => i.domains.includes(domain)) ?? null
}
