# Huddle — building with this design system

Huddle is a mobile-first shared-budget app (groups like "Home" / "Office" track expenses together, currency AED). Screens are a single **430px-wide column** on a warm off-white page. No provider or wrapper is needed: components read only their props, and `styles.css` sets the body background `#F6F3EE`, ink `#20242E` and the **Plus Jakarta Sans** font (loaded from Google Fonts).

## Styling idiom: Tailwind for layout/type, inline `style` for colour

The app never uses Tailwind colour utilities (`bg-primary`, `text-muted`, etc. do NOT exist in the shipped CSS). Follow the same split:

- **Layout, spacing, radius, type → Tailwind classes** that ship in `_ds_bundle.css` (only these resolve; arbitrary values not listed below will not):
  - flex: `flex flex-col flex-1 flex-wrap flex-shrink-0 items-center items-start items-end justify-between justify-center justify-around gap-1 gap-1.5 gap-2 gap-2.5 gap-3 gap-3.5 gap-4`
  - spacing: `p-3 p-3.5 p-4 p-5 p-6 px-2 px-3 px-4 px-5 px-6 py-1 py-1.5 py-2 py-2.5 py-3 py-3.5 py-4 pt-3 pt-4 pt-5 pt-6 pt-12 pb-4 pb-24 mx-5 mt-0.5 mt-1 mt-2 mt-3 mt-4 mt-5 mt-6 mb-2 mb-3 mb-4 mb-6`
  - radius: `rounded-xl rounded-2xl rounded-3xl rounded-full rounded-[13px] rounded-[18px] rounded-[20px] rounded-[22px]`
  - type: `text-[10px] text-[11px] text-[12px] text-[13px] text-[14px] text-[15px] text-[16px] text-[18px] text-[20px] text-[22px] text-[28px] text-[32px] text-[36px] font-medium font-semibold font-bold font-extrabold tracking-tight leading-none tabular-nums truncate`
- **Colour, borders, shadows, gradients → inline `style`** with these exact values:

| Role | Value |
|---|---|
| Page background | `#F6F3EE` |
| Card | `#fff` with `border: '1px solid #F0ECE4'` |
| Row divider | `1px solid #F4F0E9` |
| Ink (headings, amounts) | `#20242E` |
| Body text | `#2A2E37` / `#3A3F49` |
| Muted text | `#9A9FA8` |
| Primary blue | `#3B6FF6` (FAB shadow `0 12px 22px -8px rgba(59,111,246,.7)`) |
| Hero card | `linear-gradient(152deg,#4D79F8 0%,#3461E8 100%)`, white text |
| Inactive nav icon | `#B4B8C0` |

Member colours: `MEMBER_COLORS` (`#3B6FF6 #2E9E6B #E5683E #8A5CF0 #1FA0A6 #E5A020`). Category colours: `CATEGORIES` (see `CategoryIcon` docs).

## Recurring patterns
- Section heading row: `flex items-center justify-between px-5 pt-5`, title `text-[17px] font-extrabold` ink, link `text-[13px] font-bold` in primary blue.
- Card list: `mx-5 mt-3 rounded-[22px] py-1.5 px-4`, white with the card border; rows `flex items-center gap-3 py-3`.
- Amounts: format with `fmt(n)` (en-AE grouping, no decimals) and prefix `AED` (`CURRENCY`) in muted text; expenses show as `−420`.

## Exports and docs
`window.Huddle` exposes: `HuddleMark`, `MemberAvatar`, `CategoryIcon`, `TxnList`, `Greeting`, `ShareButton`, `Sk`, `BudgetHeroCardSkeleton`, `CategoriesSectionSkeleton`, `MembersSectionSkeleton`, `RecentActivitySectionSkeleton`, plus data helpers `fmt`, `CATEGORIES`, `MEMBER_COLORS`, `MONTHS`, `CURRENCY`. Read each component's `.prompt.md` before using it and `styles.css` → `_ds_bundle.css` for the full class list. For a circular `Sk`, use `style={{ borderRadius: 9999 }}` — `className="rounded-full"` is overridden.

## Example
```tsx
const { CategoryIcon, CATEGORIES, fmt, CURRENCY } = window.Huddle

<div className="mx-5 mt-3 rounded-[22px] py-1.5 px-4" style={{ background: '#fff', border: '1px solid #F0ECE4' }}>
  {CATEGORIES.slice(0, 3).map((c, i) => (
    <div key={c.name} className="flex items-center gap-3 py-3" style={{ borderBottom: i < 2 ? '1px solid #F4F0E9' : 'none' }}>
      <CategoryIcon icon={c.icon} color={c.color} bg_color={c.bg_color} size={36} iconSize={18} radius={11} />
      <div className="flex-1 text-[15px] font-bold" style={{ color: '#20242E' }}>{c.name}</div>
      <div className="text-[15px] font-extrabold tabular-nums" style={{ color: '#20242E' }}>
        <span className="text-[11px] font-semibold" style={{ color: '#9A9FA8' }}>{CURRENCY} </span>{fmt(1250)}
      </div>
    </div>
  ))}
</div>
```
