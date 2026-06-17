export type Profile = {
  id: string
  display_name: string
  avatar_color: string
  active_group_id: string | null
  created_at: string
}

export type Group = {
  id: string
  name: string
  owner_id: string
  created_at: string
}

export type GroupMember = {
  id: string
  group_id: string
  user_id: string
  role: 'owner' | 'member'
  joined_at: string
  profile?: Profile
}

export type GroupInvite = {
  id: string
  group_id: string
  code: string
  created_by: string
  created_at: string
  expires_at: string | null
  revoked: boolean
}

export type Category = {
  id: string
  name: string
  icon: string
  color: string
  bg_color: string
  is_default: boolean
}

export type Budget = {
  id: string
  group_id: string
  month: number
  year: number
  total_amount: number
  created_at: string
}

export type BudgetCategory = {
  id: string
  budget_id: string
  category_id: string
  allocated_amount: number
  category?: Category
}

export type Expense = {
  id: string
  group_id: string
  category_id: string
  paid_by: string
  amount: number
  note: string | null
  expense_date: string
  created_at: string
  category?: Category
  profile?: Profile
}

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Omit<Profile, 'created_at' | 'active_group_id'>; Update: Partial<Profile> }
      groups: { Row: Group; Insert: Omit<Group, 'id' | 'created_at'>; Update: Partial<Group> }
      group_members: { Row: GroupMember; Insert: Omit<GroupMember, 'id' | 'joined_at'>; Update: Partial<GroupMember> }
      group_invites: { Row: GroupInvite; Insert: Omit<GroupInvite, 'id' | 'created_at' | 'revoked'>; Update: Partial<GroupInvite> }
      categories: { Row: Category; Insert: Omit<Category, 'id'>; Update: Partial<Category> }
      budgets: { Row: Budget; Insert: Omit<Budget, 'id' | 'created_at'>; Update: Partial<Budget> }
      budget_categories: { Row: BudgetCategory; Insert: Omit<BudgetCategory, 'id'>; Update: Partial<BudgetCategory> }
      expenses: { Row: Expense; Insert: Omit<Expense, 'id' | 'created_at'>; Update: Partial<Expense> }
    }
  }
}
