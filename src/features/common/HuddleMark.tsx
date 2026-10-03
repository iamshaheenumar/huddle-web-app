type Variant = 'tile' | 'soft' | 'mono'

const PEOPLE = [
  { arc: 'M 157 138 A 154 154 0 0 1 355 138', head: [256, 190] },
  { arc: 'M 407.7 229.3 A 154 154 0 0 1 308.7 400.7', head: [313.2, 289] },
  { arc: 'M 203.3 400.7 A 154 154 0 0 1 104.3 229.3', head: [198.8, 289] },
] as const

const PALETTES: Record<Variant, { bg?: string; people: [string, string, string] }> = {
  tile: { bg: '#3B6FF6', people: ['#fff', '#A9C0FB', '#20242E'] },
  soft: { bg: '#EAF0FE', people: ['#3B6FF6', '#A9C0FB', '#20242E'] },
  mono: { people: ['currentColor', 'currentColor', 'currentColor'] },
}

type Props = {
  size?: number
  variant?: Variant
  shadow?: boolean
  className?: string
}

export default function HuddleMark({ size = 64, variant = 'tile', shadow = false, className }: Props) {
  const { bg, people } = PALETTES[variant]

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role="img"
      aria-label="Huddle"
      className={className}
      style={{
        flexShrink: 0,
        borderRadius: bg ? size * 0.2266 : undefined,
        boxShadow: shadow && bg ? '0 10px 22px -8px rgba(59,111,246,.6)' : undefined,
      }}
    >
      {bg && <rect width="512" height="512" rx="116" fill={bg} />}
      {PEOPLE.map(({ arc, head }, i) => (
        <g key={i} fill={people[i]}>
          <path d={arc} stroke={people[i]} strokeWidth="54" strokeLinecap="round" fill="none" />
          <circle cx={head[0]} cy={head[1]} r="40" />
        </g>
      ))}
    </svg>
  )
}
