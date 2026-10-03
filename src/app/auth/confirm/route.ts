import { NextResponse, type NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

// Landing point for Supabase email links (invites). The email template links
// here with a token_hash, which we exchange for a session cookie before
// forwarding to `next`. Invites can't use PKCE, hence verifyOtp.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'
  // Only allow same-origin relative paths to avoid open redirects.
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'

  if (tokenHash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error) return NextResponse.redirect(new URL(safeNext, request.url))
  }

  return NextResponse.redirect(new URL('/login?error=invite', request.url))
}
