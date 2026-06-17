type Props = {
  name: string
  color: string
  size?: number
  fontSize?: number
}

export default function MemberAvatar({ name, color, size = 38, fontSize = 14 }: Props) {
  const initial = name.charAt(0).toUpperCase()
  return (
    <div
      className="rounded-full flex items-center justify-center font-extrabold flex-shrink-0"
      style={{ width: size, height: size, background: color, color: '#fff', fontSize }}
    >
      {initial}
    </div>
  )
}
