---
category: Brand
---
# HuddleMark

The Huddle logo: three people arcs forming a circle. Use it in app headers, empty states, splash/auth screens and the profile page.

- `variant="tile"` (default) — white/light-blue/ink people on a primary-blue `#3B6FF6` rounded tile. App icon look.
- `variant="soft"` — blue people on a pale `#EAF0FE` tile. Use on light cards and empty states.
- `variant="mono"` — no tile, people drawn in `currentColor`. Set `color` on a parent (or `className="text-…"`).
- `shadow` adds the blue drop-shadow (tile/soft only).

```tsx
<HuddleMark size={64} shadow />
<HuddleMark size={48} variant="soft" />
<span style={{ color: '#20242E' }}><HuddleMark size={24} variant="mono" /></span>
```
