'use client'
import { useRouter } from 'next/navigation'
import { UserMinusIcon } from '@phosphor-icons/react'
import { removeMember } from '../actions'

export default function RemoveMemberButton({ userId, name }: { userId: string; name: string }) {
  const router = useRouter()

  async function handleRemove() {
    if (!confirm(`Remove ${name} from the group?`)) return
    const { error } = await removeMember(userId)
    if (error) alert(error)
    else router.refresh()
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
