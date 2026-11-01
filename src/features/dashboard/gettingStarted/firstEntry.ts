// Set while the "+" tip is showing, so the next visit to Home after the first
// entry can say what just happened, once. Kept on this device only: the
// note is about something done here. Storage can be unavailable (private
// mode), so every access is guarded.
const KEY = 'huddle:first-entry-pending'

export function markFirstEntryPending() {
  try { localStorage.setItem(KEY, '1') } catch {}
}

export function isFirstEntryPending(): boolean {
  try { return localStorage.getItem(KEY) === '1' } catch { return false }
}

export function clearFirstEntryPending() {
  try { localStorage.removeItem(KEY) } catch {}
}
