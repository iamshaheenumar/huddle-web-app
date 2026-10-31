import { NextResponse, type NextRequest } from 'next/server'
import { isAuthPKCECodeVerifierMissingError, type EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

// Landing point for Supabase email links. Invites arrive with a token_hash
// (they can't use PKCE, hence verifyOtp); signup confirmations arrive with a
// PKCE `code`. Either is exchanged for a session cookie before forwarding to `next`.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const code = searchParams.get('code')
  // Signup confirmations go to the set-up screens even when the email template
  // builds its own link without `next` (a custom token_hash template does).
  const isSignup = !!code || type === 'signup' || type === 'email'
  const next = searchParams.get('next') ?? (isSignup ? '/welcome/confirmed' : '/dashboard')
  // Only allow same-origin relative paths to avoid open redirects.
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'
  const to = (path: string) => NextResponse.redirect(new URL(path, request.url))

  // Supabase sends people back with error_code when the link was already used or has expired.
  if (searchParams.get('error_code') || searchParams.get('error')) return to('/auth/link-expired')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return to(safeNext)
    // Opened in a different browser from the one that signed up: Supabase has
    // confirmed the email, but this browser can't finish the sign-in.
    if (isAuthPKCECodeVerifierMissingError(error)) return to('/login?confirmed=1')
    return to('/auth/link-expired')
  }

  if (tokenHash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error) return to(safeNext)
    return to(type === 'invite' ? '/auth/link-expired?kind=invite' : '/auth/link-expired')
  }

  return to('/auth/link-expired')
}
