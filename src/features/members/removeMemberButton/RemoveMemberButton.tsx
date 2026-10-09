'use client'
import { UserMinusIcon } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'
import { useInvalidateAppData } from '@/lib/query/invalidate'

export default function RemoveMemberButton({ groupId, userId, name }: { groupId: string; userId: string; name: string }) {
  const invalidateAppData = useInvalidateAppData()

  async function handleRemove() {
    if (!confirm(`Remove ${name} from the group?`)) return
    // RLS only lets the group owner delete; a blocked delete is silent, so check what was removed.
    const { data, error } = await createClient()
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .select('user_id')
    if (error) return alert(error.message)
    if (!data || data.length === 0) return alert('Only the group owner can remove members')
    await invalidateAppData()
  }

  return (
    <button
      onClick={handleRemove}
      aria-label={`Remove ${name}`}
      className="flex items-center justify-center rounded-[10px] shrink-0"
      style={{ width: 32, height: 32, color: '#E5683E', background: '#FDF0EB', border: 'none' }}
    >
      <UserMinusIcon size={16} weight="bold" />
    </button>
  )
}
