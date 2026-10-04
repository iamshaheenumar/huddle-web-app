// expense_date is a plain YYYY-MM-DD; format it in UTC so the server's zone can't shift the day.
export function dayLabel(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-AE', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
}

export function todayDate() {
  return new Date().toISOString().split('T')[0]
}

export function isYesterday(date: string) {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - 1)
  return date === d.toISOString().split('T')[0]
}

// created_at is a timestamptz; show it in the app's home zone (AED → UAE).
export function timeLabel(ts: string) {
  return new Date(ts).toLocaleTimeString('en-AE', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Dubai' })
}
