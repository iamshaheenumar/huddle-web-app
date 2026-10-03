import { MemberAvatar, MEMBER_COLORS } from 'huddle'

const NAMES = ['Aisha', 'Omar', 'Priya', 'Daniel', 'Fatima', 'Rahul']

export const Default = () => <MemberAvatar name="Aisha Khan" color="#3B6FF6" />
export const Palette = () => (
  <div style={{ display: 'flex', gap: 10 }}>
    {NAMES.map((n, i) => <MemberAvatar key={n} name={n} color={MEMBER_COLORS[i]} />)}
  </div>
)
export const Sizes = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <MemberAvatar name="Omar" color="#E5683E" size={28} fontSize={11} />
    <MemberAvatar name="Omar" color="#E5683E" size={34} fontSize={13} />
    <MemberAvatar name="Omar" color="#E5683E" />
    <MemberAvatar name="Omar" color="#E5683E" size={44} fontSize={16} />
  </div>
)
