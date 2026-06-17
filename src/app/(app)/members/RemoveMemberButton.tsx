'use client'
import { useRouter } from 'next/navigation'
import { removeMember } from './actions'

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
      className="text-[11px] font-bold rounded-[6px] px-2 py-1"
      style={{ color: '#E5683E', background: '#FDF0EB', border: 'none' }}
    >
      Remove
    </button>
  )
}
