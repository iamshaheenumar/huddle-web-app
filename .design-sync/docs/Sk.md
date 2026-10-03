---
category: Loading
---
# Sk

Skeleton placeholder block: a pulsing `#E8E3DA` box with `animate-pulse rounded-xl` baked in. Size it with `style={{ width, height }}`. On the blue hero card, override the fill with `style.background` (`rgba(255,255,255,.25)`).

Shape: pass the radius through `style`, NOT a Tailwind class — `className="rounded-full"` loses to the built-in `rounded-xl` (same specificity, later in the stylesheet), so it still renders as a rounded square. For a circle use `style={{ borderRadius: 9999 }}`.

```tsx
<Sk style={{ width: 130, height: 13 }} />
<Sk style={{ width: 44, height: 44, borderRadius: 9999 }} />
```
