import type { EndType, Frequency, RecurringExpense } from '@/types'

// Date math for recurring payments. Dates are plain YYYY-MM-DD handled in UTC,
// and every function here mirrors its SQL twin in supabase/schema.sql so the
// app can preview (and show offline) exactly what the server will do.

export type Schedule = {
  frequency: Frequency
  start_date: string
  end_type: EndType
  end_date: string | null
  max_occurrences: number | null
}

const iso = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d)).toISOString().slice(0, 10)
const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate()

function addDays(date: string, n: number) {
  const t = new Date(`${date}T00:00:00Z`)
  t.setUTCDate(t.getUTCDate() + n)
  return t.toISOString().slice(0, 10)
}

// Clamps to the month's last day, like Postgres' date + interval 'n months'.
function addMonths(date: string, n: number) {
  const [y, m, d] = date.split('-').map(Number)
  const total = y * 12 + (m - 1) + n
  const ty = Math.floor(total / 12)
  const tm = (total % 12) + 1
  return iso(ty, tm, Math.min(d, daysInMonth(ty, tm)))
}

// The n-th date (0-based) of a series; recurring_occurrence() in SQL.
export function occurrence(start: string, frequency: Frequency, n: number): string {
  switch (frequency) {
    case 'daily': return addDays(start, n)
    case 'weekly': return addDays(start, 7 * n)
    case 'monthly': return addMonths(start, n)
    case 'yearly': return addMonths(start, 12 * n)
  }
}

// Index of the first date on or after `from`; recurring_first_index_on_or_after().
export function firstIndexOnOrAfter(start: string, frequency: Frequency, from: string): number {
  if (from <= start) return 0
  const days = Math.round((Date.parse(from) - Date.parse(start)) / 86_400_000)
  const [fy, fm] = from.split('-').map(Number)
  const [sy, sm] = start.split('-').map(Number)
  let n = frequency === 'daily' ? days
    : frequency === 'weekly' ? Math.floor(days / 7)
    : frequency === 'monthly' ? (fy - sy) * 12 + fm - sm
    : fy - sy
  while (n > 0 && occurrence(start, frequency, n - 1) >= from) n--
  while (occurrence(start, frequency, n) < from) n++
  return n
}

// The due date at `index`, or null once the series has ended; recurring_next_due().
export function dueAt(s: Schedule, index: number, created: number): string | null {
  if (s.end_type === 'after_count' && created >= (s.max_occurrences ?? 0)) return null
  const date = occurrence(s.start_date, s.frequency, index)
  if (s.end_type === 'on_date' && s.end_date && date > s.end_date) return null
  return date
}

// Whether saving a new rule also logs its first payment now; create_recurring_expense().
export function createsFirstPayment(s: Schedule, today: string) {
  return s.start_date <= today && (s.end_type !== 'on_date' || !s.end_date || s.start_date <= s.end_date)
}

// Index, count and next due date of a rule as create_recurring_expense() saves it.
export function initialPosition(s: Schedule, today: string) {
  const created = createsFirstPayment(s, today) ? 1 : 0
  return { next_index: created, occurrences_created: created, next_due_date: dueAt(s, created, created) }
}

// Where an edited rule continues from; update_recurring_expense().
export function editedPosition(old: RecurringExpense, s: Schedule, today: string) {
  const rescheduled = old.frequency !== s.frequency || old.start_date !== s.start_date
  const next_index = rescheduled
    ? firstIndexOnOrAfter(s.start_date, s.frequency, today)
    : old.next_due_date === null
      ? Math.max(old.next_index, firstIndexOnOrAfter(s.start_date, s.frequency, today))
      : old.next_index
  return { next_index, next_due_date: dueAt(s, next_index, old.occurrences_created) }
}

// Where a resumed rule continues from, skipping dates missed while paused; set_recurring_active().
export function resumedPosition(r: RecurringExpense, today: string) {
  const next_index = Math.max(r.next_index, firstIndexOnOrAfter(r.start_date, r.frequency, today))
  return { next_index, next_due_date: dueAt(r, next_index, r.occurrences_created) }
}

// Average cost per month, for "Committed each month".
export function monthlyEquivalent(amount: number, frequency: Frequency) {
  switch (frequency) {
    case 'daily': return (amount * 365) / 12
    case 'weekly': return (amount * 52) / 12
    case 'monthly': return amount
    case 'yearly': return amount / 12
  }
}

export const FREQUENCIES: Frequency[] = ['daily', 'weekly', 'monthly', 'yearly']

export const FREQUENCY_LABEL: Record<Frequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
}

const utcDate = (date: string) => new Date(`${date}T00:00:00Z`)

// "21 Jan"
export const shortDate = (date: string) =>
  utcDate(date).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', timeZone: 'UTC' })

// "21 Jan 2027"
export const longDate = (date: string) =>
  utcDate(date).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

function ordinal(n: number) {
  const tens = n % 100
  if (tens >= 11 && tens <= 13) return `${n}th`
  return `${n}${({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th'}`
}

// "Every day", "Every Wednesday", "Monthly on the 15th", "Yearly on 15 Jan"
export function scheduleLabel(frequency: Frequency, start: string) {
  switch (frequency) {
    case 'daily': return 'Every day'
    case 'weekly': return `Every ${utcDate(start).toLocaleDateString('en-AE', { weekday: 'long', timeZone: 'UTC' })}`
    case 'monthly': return `Monthly on the ${ordinal(Number(start.slice(8, 10)))}`
    case 'yearly': return `Yearly on ${shortDate(start)}`
  }
}

export function endsLabel(s: Pick<Schedule, 'end_type' | 'end_date' | 'max_occurrences'>) {
  if (s.end_type === 'on_date' && s.end_date) return `On ${longDate(s.end_date)}`
  if (s.end_type === 'after_count' && s.max_occurrences) {
    return `After ${s.max_occurrences} payment${s.max_occurrences === 1 ? '' : 's'}`
  }
  return 'Never'
}
