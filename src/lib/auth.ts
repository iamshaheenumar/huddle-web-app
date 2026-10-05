import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type AuthUser = { id: string; email: string | undefined }

// One auth check per request, shared by the layout and every page context.
// getClaims() verifies the JWT locally (with asymmetric signing keys) instead
// of calling Supabase Auth like getUser() does, so navigations skip a round trip.
export const getAuth = cache(async () => {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) redirect('/login')
  const user: AuthUser = { id: data.claims.sub, email: data.claims.email as string | undefined }
  return { supabase, user }
})
