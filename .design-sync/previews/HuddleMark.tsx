import { HuddleMark } from 'huddle'

export const Tile = () => <HuddleMark size={72} shadow />
export const Soft = () => <HuddleMark size={72} variant="soft" />
export const Mono = () => <span style={{ color: '#20242E' }}><HuddleMark size={72} variant="mono" /></span>
export const Sizes = () => (
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
    <HuddleMark size={24} />
    <HuddleMark size={40} />
    <HuddleMark size={64} shadow />
  </div>
)
