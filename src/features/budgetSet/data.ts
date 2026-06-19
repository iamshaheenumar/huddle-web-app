import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getActiveGroup } from '@/lib/group'
import { CATEGORIES } from '@/lib/constants'
import type { Category } from '@/types'

export type BudgetSetData = {
  groupId: string
  groupName: string
  categories: Category[]
  totalBudget: number
  allocations: Record<string, number>
  month: number
  year: number
}

export const getBudgetSetData = cache(async (): Promise<BudgetSetData> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const group = await getActiveGroup(supabase, user.id)

  const { data: catsData } = await supabase.from('categories').select('*').eq('is_default', true).order('name')
  let cats = catsData as Category[] | null
  if (!cats || cats.length === 0) {
    const inserts = CATEGORIES.map(c => ({ name: c.name, icon: c.icon, color: c.color, bg_color: c.bg_color, is_default: true }))
    const { data: newCats } = await supabase.from('categories').insert(inserts).select()
    cats = newCats as Category[] | null
  }
  const categories = cats ?? []

  let totalBudget = 0
  const allocations: Record<string, number> = {}

  const { data: budget } = await supabase.from('budgets').select('id, total_amount').eq('group_id', group.id).eq('month', month).eq('year', year).single()
  const b = budget as { id: string; total_amount: number } | null
  if (b) {
    totalBudget = b.total_amount
    const { data: bcs } = await supabase.from('budget_categories').select('category_id, allocated_amount').eq('budget_id', b.id)
    ;(bcs as { category_id: string; allocated_amount: number }[] | null)?.forEach(bc => { allocations[bc.category_id] = bc.allocated_amount })
  } else {
    categories.forEach(c => { allocations[c.id] = 0 })
  }

  return { groupId: group.id, groupName: group.name, categories, totalBudget, allocations, month, year }
})
