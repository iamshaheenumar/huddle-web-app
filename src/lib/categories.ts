import type { Category } from '@/types'

export type CategoryColor = { color: string; bg_color: string }

// The first five match the seeded default categories, so a new custom
// category naturally lands on one of the remaining colors.
export const CATEGORY_COLORS: CategoryColor[] = [
  { color: '#2E9E6B', bg_color: '#E6F4EC' },
  { color: '#E5683E', bg_color: '#FBE8E1' },
  { color: '#3B6FF6', bg_color: '#E9F0FE' },
  { color: '#1FA0A6', bg_color: '#E0F3F4' },
  { color: '#8A5CF0', bg_color: '#EFE9FD' },
  { color: '#E5A020', bg_color: '#FCF3E0' },
  { color: '#D6457A', bg_color: '#FBE6EE' },
  { color: '#5B5BD6', bg_color: '#ECECFB' },
  { color: '#A0703C', bg_color: '#F4ECE3' },
  { color: '#7FA32B', bg_color: '#F0F5E3' },
  { color: '#5B6B8C', bg_color: '#E9ECF2' },
  { color: '#2B8FD6', bg_color: '#E3F1FB' },
]

// Counts how many of the given categories use each palette color.
export function colorUsage(categories: Pick<Category, 'color'>[]): Map<string, number> {
  const usage = new Map<string, number>()
  for (const c of categories) {
    const key = c.color.toUpperCase()
    usage.set(key, (usage.get(key) ?? 0) + 1)
  }
  return usage
}

// First palette color no category uses yet; once all are taken, the least-used one.
export function pickUnusedColor(categories: Pick<Category, 'color'>[]): CategoryColor {
  const usage = colorUsage(categories)
  let best = CATEGORY_COLORS[0]
  let bestCount = Infinity
  for (const c of CATEGORY_COLORS) {
    const count = usage.get(c.color.toUpperCase()) ?? 0
    if (count < bestCount) {
      best = c
      bestCount = count
    }
  }
  return best
}
