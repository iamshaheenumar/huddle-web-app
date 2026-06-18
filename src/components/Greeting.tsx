'use client'

import { useState, useEffect } from 'react'

function greetingForHour(hour: number) {
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
}

export default function Greeting({ name, initial }: { name: string; initial: string }) {
  // Seed with the server-computed greeting so SSR and first client render match,
  // then correct to the user's local time after mount.
  const [greeting, setGreeting] = useState(initial)

  useEffect(() => {
    setGreeting(greetingForHour(new Date().getHours()))
  }, [])

  return (
    <div className="text-[13px] font-semibold" style={{ color: '#9A9FA8' }}>
      {greeting}, {name}
    </div>
  )
}
