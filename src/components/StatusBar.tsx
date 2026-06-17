import { CellSignalFull, WifiHigh, BatteryFull } from '@phosphor-icons/react/dist/ssr'

export default function StatusBar() {
  return (
    <div className="flex items-center justify-between px-6 pt-4 pb-1">
      <span className="text-[15px] font-bold" style={{ color: '#20242E' }}>9:41</span>
      <div className="flex gap-1.5 items-center" style={{ color: '#20242E' }}>
        <CellSignalFull size={16} weight="fill" />
        <WifiHigh size={16} weight="fill" />
        <BatteryFull size={16} weight="fill" />
      </div>
    </div>
  )
}
