'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function deleteExpense(expenseId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // RLS only lets group members delete; a blocked delete is silent, so check what was removed.
  const { data, error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId)
    .select('id')

  if (error) return { error: error.message }
  if (!data || data.length === 0) return { error: 'Transaction not found or already deleted' }

  // Spend totals show up on the dashboard, history, categories and members pages.
  revalidatePath('/', 'layout')
  return {}
}
