export function Sk({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`animate-pulse rounded-xl ${className ?? ''}`} style={{ background: '#E8E3DA', ...style }} />
}
