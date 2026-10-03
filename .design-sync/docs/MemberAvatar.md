---
category: Members
---
# MemberAvatar

Circular avatar showing the first letter of a group member's name on their assigned colour, in white extra-bold type. Every member has an `avatar_color` from the palette `MEMBER_COLORS` (`#3B6FF6`, `#2E9E6B`, `#E5683E`, `#8A5CF0`, `#1FA0A6`, `#E5A020`).

Sizes used in the app: 38 (default, member cards), 34 (activity rows, fontSize 13), 28 (transaction lists, fontSize 11), 44 (header, fontSize 16).

```tsx
<MemberAvatar name="Aisha Khan" color="#3B6FF6" />
<MemberAvatar name="Omar" color="#E5683E" size={28} fontSize={11} />
```
