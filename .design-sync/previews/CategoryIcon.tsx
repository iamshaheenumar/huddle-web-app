import { CategoryIcon, CATEGORIES } from 'huddle'

export const Groceries = () => <CategoryIcon icon="ShoppingCart" color="#2E9E6B" bg_color="#E6F4EC" />
export const AllCategories = () => (
  <div style={{ display: 'flex', gap: 10 }}>
    {CATEGORIES.map(c => <CategoryIcon key={c.name} icon={c.icon} color={c.color} bg_color={c.bg_color} />)}
  </div>
)
export const ListSize = () => (
  <div style={{ display: 'flex', gap: 10 }}>
    {CATEGORIES.map(c => <CategoryIcon key={c.name} icon={c.icon} color={c.color} bg_color={c.bg_color} size={36} iconSize={18} radius={11} />)}
  </div>
)
export const Unknown = () => <CategoryIcon icon="Gift" color="#9A9FA8" bg_color="#F0ECE4" />
