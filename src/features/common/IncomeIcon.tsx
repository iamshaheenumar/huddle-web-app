import { ArrowDownLeft } from '@phosphor-icons/react/dist/ssr'
import { INCOME_COLOR } from '@/lib/transactions'

// The tile an income row shows in place of a category icon.
export default function IncomeIcon({ size = 42, iconSize = 21, radius = 13 }: { size?: number; iconSize?: number; radius?: number }) {
  return (
    <div
      className="flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size, borderRadius: radius, background: '#E6F4EC', color: INCOME_COLOR }}
    >
      <ArrowDownLeft size={iconSize} weight="bold" />
    </div>
  )
}
