'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { AuthUser } from '@/lib/auth'

// The signed-in user, read from the locally stored Supabase session (no network
// call unless the token needs refreshing). A failed refresh throws so the
// previously cached user is kept while offline.
export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: async (): Promise<AuthUser | null> => {
      const { data, error } = await createClient().auth.getSession()
      if (error) throw error
      const user = data.session?.user
      return user ? { id: user.id, email: user.email } : null
    },
    networkMode: 'always',
    staleTime: 0,
  })
}
