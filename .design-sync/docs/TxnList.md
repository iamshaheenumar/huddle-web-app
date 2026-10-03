---
category: Budget
---
# TxnList

Compact list of expense transactions, rendered inside an expanded category or member card on the History page. It draws its own top divider (`1px solid #F0ECE4`), so put it at the bottom of a white card. Amounts are shown as `−1,250` (formatted with `fmt`, no currency). Empty list renders "No transactions this month".

- `show="payer"` — each row leads with the payer's `MemberAvatar` and the subline is the payer's first name · date (use inside a category card).
- `show="category"` — no avatar; subline is the category name · date (use inside a member card).

`transactions` items: `{ id, amount, note: string | null, date: 'YYYY-MM-DD', categoryName, payerName, payerColor }`. The title line is `note`, falling back to `categoryName`.

```tsx
<div style={{ background: '#fff', border: '1px solid #F0ECE4', borderRadius: 22, padding: 16 }}>
  …card header…
  <TxnList show="payer" transactions={[
    { id: '1', amount: 420, note: 'Carrefour weekly shop', date: '2026-09-28', categoryName: 'Groceries', payerName: 'Aisha Khan', payerColor: '#3B6FF6' },
  ]} />
</div>
```
