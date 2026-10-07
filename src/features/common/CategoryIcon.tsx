import {
  ShoppingCart,
  ForkKnife,
  Lightning,
  Car,
  ShoppingBag,
  House,
  Heartbeat,
  Pill,
  GraduationCap,
  Airplane,
  Bus,
  GasPump,
  GameController,
  FilmSlate,
  MusicNotes,
  Coffee,
  Hamburger,
  Wine,
  Gift,
  PawPrint,
  Baby,
  TShirt,
  Scissors,
  Barbell,
  WifiHigh,
  DeviceMobile,
  Wrench,
  Drop,
  Book,
  Briefcase,
  PiggyBank,
  HandHeart,
  Palette,
  Question,
} from '@phosphor-icons/react/dist/ssr'

const ICON_MAP: Record<string, React.ComponentType<{ size: number; weight: 'fill' | 'regular' }>> = {
  ShoppingCart,
  ForkKnife,
  Lightning,
  Car,
  ShoppingBag,
  House,
  Heartbeat,
  Pill,
  GraduationCap,
  Airplane,
  Bus,
  GasPump,
  GameController,
  FilmSlate,
  MusicNotes,
  Coffee,
  Hamburger,
  Wine,
  Gift,
  PawPrint,
  Baby,
  TShirt,
  Scissors,
  Barbell,
  WifiHigh,
  DeviceMobile,
  Wrench,
  Drop,
  Book,
  Briefcase,
  PiggyBank,
  HandHeart,
  Palette,
}

// Every icon a category can use — the add-category picker reads this so it
// can never offer an icon this component can't render.
export const CATEGORY_ICON_NAMES = Object.keys(ICON_MAP)

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
