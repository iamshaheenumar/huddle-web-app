---
category: Budget
---
# CategoryIcon

Rounded-square tile holding a filled Phosphor icon for a budget category. `icon` is a Phosphor icon NAME string; supported: `ShoppingCart`, `ForkKnife`, `Lightning`, `Car`, `ShoppingBag` (anything else renders a `Question` icon). `color` is the icon colour, `bg_color` the tile fill.

The default categories (exported as `CATEGORIES`) and their colours:

| name | icon | color | bg_color |
|---|---|---|---|
| Groceries | ShoppingCart | #2E9E6B | #E6F4EC |
| Eating out | ForkKnife | #E5683E | #FBE8E1 |
| Bills & Utilities | Lightning | #3B6FF6 | #E9F0FE |
| Transport | Car | #1FA0A6 | #E0F3F4 |
| Shopping | ShoppingBag | #8A5CF0 | #EFE9FD |

Sizes: 42/21/13 (default), 36 with `iconSize={18} radius={11}` in list rows.

```tsx
<CategoryIcon icon="ShoppingCart" color="#2E9E6B" bg_color="#E6F4EC" />
{CATEGORIES.map(c => <CategoryIcon key={c.name} {...c} size={36} iconSize={18} radius={11} />)}
```
