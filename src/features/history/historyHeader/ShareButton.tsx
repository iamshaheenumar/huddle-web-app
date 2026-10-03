'use client'

import { useState } from 'react'

export default function ShareButton({ groupName }: { groupName: string }) {
  const [copied, setCopied] = useState(false)

  const onShare = async () => {
    const url = window.location.href
    const shareData = { title: `${groupName} — Spending history`, text: `${groupName}'s spending history`, url }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 1600)
      }
    } catch {
      // User dismissed the share sheet, or the API is unavailable — nothing to do.
    }
  }

  return (
    <button
      onClick={onShare}
      aria-label="Share spending history"
      className="w-10 h-10 rounded-[13px] flex items-center justify-center"
      style={{ background: copied ? '#20242E' : '#fff', border: '1px solid #EAE5DD', color: copied ? '#fff' : '#3A3F49' }}
    >
      {copied ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" /><path d="M16 6l-4-4-4 4" /><path d="M12 2v13" /></svg>
      )}
    </button>
  )
}
