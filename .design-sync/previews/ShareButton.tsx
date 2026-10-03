import { ShareButton } from 'huddle'

export const Default = () => <ShareButton groupName="Home" />
export const InHistoryHeader = () => (
  <div className="flex items-center justify-between" style={{ width: 340 }}>
    <div>
      <div className="text-[13px] font-semibold" style={{ color: '#9A9FA8' }}>Home</div>
      <div className="text-[22px] font-extrabold tracking-tight" style={{ color: '#20242E' }}>History</div>
    </div>
    <ShareButton groupName="Home" />
  </div>
)
