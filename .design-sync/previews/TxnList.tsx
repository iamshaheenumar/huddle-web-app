import { TxnList, CategoryIcon } from 'huddle'

const TXNS = [
  { id: '1', amount: 420, note: 'Carrefour weekly shop', date: '2026-09-28', categoryName: 'Groceries', payerName: 'Aisha Khan', payerColor: '#3B6FF6' },
  { id: '2', amount: 86, note: null, date: '2026-09-24', categoryName: 'Groceries', payerName: 'Omar Haddad', payerColor: '#E5683E' },
  { id: '3', amount: 1250, note: 'Lulu monthly stock-up', date: '2026-09-15', categoryName: 'Groceries', payerName: 'Priya Nair', payerColor: '#2E9E6B' },
]

const Card = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: 360, background: '#fff', border: '1px solid #F0ECE4', borderRadius: 22, padding: 16 }}>{children}</div>
)

export const ByPayer = () => (
  <Card>
    <div className="flex items-center gap-3">
      <CategoryIcon icon="ShoppingCart" color="#2E9E6B" bg_color="#E6F4EC" size={36} iconSize={18} radius={11} />
      <div className="flex-1 text-[15px] font-bold" style={{ color: '#20242E' }}>Groceries</div>
      <div className="text-[15px] font-extrabold" style={{ color: '#20242E' }}>1,756</div>
    </div>
    <TxnList show="payer" transactions={TXNS} />
  </Card>
)
export const ByCategory = () => (
  <Card>
    <TxnList show="category" transactions={TXNS} />
  </Card>
)
export const Empty = () => (
  <Card>
    <TxnList show="payer" transactions={[]} />
  </Card>
)
