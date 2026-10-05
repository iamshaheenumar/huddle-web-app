'use server'
import { revalidatePath } from 'next/cache'

// Purges the client router cache (staleTimes) for every page. Call after a
// client-side Supabase write so no tab keeps showing pre-mutation data.
export async function revalidateAppData(): Promise<void> {
  revalidatePath('/', 'layout')
}
