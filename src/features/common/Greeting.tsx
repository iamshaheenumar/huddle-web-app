'use client'

function greetingForHour(hour: number) {
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
}

// Only rendered client-side (once the header has data), so the user's local
// hour is always available.
export default function Greeting({ name }: { name: string }) {
  return (
    <div className="text-[13px] font-semibold" style={{ color: '#9A9FA8' }}>
      {greetingForHour(new Date().getHours())}, {name}
    </div>
  )
}
