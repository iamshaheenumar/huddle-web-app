export function Sk({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`animate-pulse rounded-xl ${className ?? ''}`} style={{ background: 'var(--line)', ...style }} />
}
