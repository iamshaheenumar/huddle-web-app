import {
  ShoppingCart,
  ForkKnife,
  Lightning,
  Car,
  ShoppingBag,
  Question,
} from '@phosphor-icons/react/dist/ssr'

const ICON_MAP: Record<string, React.ComponentType<{ size: number; weight: 'fill' | 'regular' }>> = {
  ShoppingCart,
  ForkKnife,
  Lightning,
  Car,
  ShoppingBag,
}

type Props = {
  icon: string
  color: string
  bg_color: string
  size?: number
  iconSize?: number
  radius?: number
}

export default function CategoryIcon({ icon, color, bg_color, size = 42, iconSize = 21, radius = 13 }: Props) {
  const Icon = ICON_MAP[icon] ?? Question
  return (
    <div
      className="flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size, borderRadius: radius, background: bg_color, color }}
    >
      <Icon size={iconSize} weight="fill" />
    </div>
  )
}
