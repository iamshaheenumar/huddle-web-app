import { ArrowDownLeft } from '@phosphor-icons/react/dist/ssr'
import { INCOME_COLOR } from '@/lib/transactions'

type Props = { size?: number; iconSize?: number; radius?: number; muted?: boolean }

// The tile an income row shows in place of a category icon. `muted` greys it
// out, as for a paused recurring income.
export default function IncomeIcon({ size = 42, iconSize = 21, radius = 13, muted }: Props) {
  return (
    <div
      className="flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size, borderRadius: radius, background: muted ? '#F2EFEA' : '#E6F4EC', color: muted ? 'var(--muted)' : INCOME_COLOR }}
    >
      <ArrowDownLeft size={iconSize} weight="bold" />
    </div>
  )
}
