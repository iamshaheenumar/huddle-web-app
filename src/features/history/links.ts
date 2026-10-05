import type { HistoryView } from './types'

export const parseView = (s?: string): HistoryView =>
  s === 'categories' || s === 'members' ? s : 'transactions'

// Builds a /history URL that keeps the selected month and tab in sync; defaults are omitted.
export function historyHref(period: string | undefined, view: HistoryView) {
  const params = new URLSearchParams()
  if (period) params.set('period', period)
  if (view !== 'transactions') params.set('view', view)
  const qs = params.toString()
  return qs ? `/history?${qs}` : '/history'
}
