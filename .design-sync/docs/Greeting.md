---
category: Header
---
# Greeting

Small muted (`#9A9FA8`, 13px semibold) time-of-day greeting line shown above the group name in the dashboard header: "Good morning, Aisha". `initial` is the greeting shown before mount (the server computes it); after mount it switches to the viewer's local time.

```tsx
<Greeting name="Aisha" initial="Good morning" />
```
