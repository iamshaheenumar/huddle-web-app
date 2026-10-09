// Marks a row saved on this device that hasn't reached the server yet.
export default function SyncingBadge() {
  return (
    <span className="shrink-0 flex items-center gap-1 text-[11px] font-bold" style={{ color: '#C08A2E' }}>
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#E0A341' }} />
      Syncing
    </span>
  )
}
