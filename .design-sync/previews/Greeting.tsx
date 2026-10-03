import { Greeting } from 'huddle'

export const InHeader = () => (
  <div style={{ width: 300 }}>
    <Greeting name="Aisha" initial="Good morning" />
    <div className="text-[22px] font-extrabold tracking-tight mt-0.5" style={{ color: '#20242E' }}>Home</div>
  </div>
)
export const Alone = () => <Greeting name="Omar" initial="Good evening" />
