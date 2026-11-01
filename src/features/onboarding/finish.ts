'use client'

import { createClient } from '@/lib/supabase/client'
import { revalidateAppData } from '@/lib/actions'
import { clearPersistedCache } from '@/lib/query/client'

// Set-up is done (or skipped): stop routing sign-ins to it and turn on the
// "Get started" checklist on Home. Starts Home from an empty cache so a
// previous user's data never shows.
export async function finishOnboarding() {
  await createClient().auth.updateUser({ data: { onboarding: false, getting_started: true } })
  await Promise.all([revalidateAppData(), clearPersistedCache()])
}
