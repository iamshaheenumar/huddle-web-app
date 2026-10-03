import { Sk } from 'huddle'

export const TextLines = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 220 }}>
    <Sk style={{ width: 130, height: 13 }} />
    <Sk style={{ width: 100, height: 20 }} />
  </div>
)
export const Avatar = () => <Sk style={{ width: 44, height: 44, borderRadius: 9999 }} />
export const Row = () => (
  <div className="flex items-center gap-3 rounded-2xl p-3" style={{ background: '#fff', border: '1px solid #F0ECE4', width: 320 }}>
    <Sk className="flex-shrink-0" style={{ width: 34, height: 34, borderRadius: 9999 }} />
    <div className="flex-1 flex flex-col gap-2">
      <Sk style={{ width: '55%', height: 13 }} />
      <Sk style={{ width: '40%', height: 11 }} />
    </div>
    <Sk style={{ width: 48, height: 14 }} />
  </div>
)
