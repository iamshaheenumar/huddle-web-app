'use client'

type Props = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  size?: 'md' | 'sm'
  disabled?: boolean
}

const SIZES = {
  md: { width: 44, height: 26, knob: 20, pad: 3 },
  sm: { width: 34, height: 20, knob: 16, pad: 2 },
}

// On/off switch. `label` names it for screen readers.
export default function Toggle({ checked, onChange, label, size = 'md', disabled }: Props) {
  const s = SIZES[size]
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={e => {
        e.stopPropagation()
        onChange(!checked)
      }}
      className="flex-shrink-0 rounded-full transition-colors disabled:opacity-50"
      style={{ width: s.width, height: s.height, padding: s.pad, background: checked ? '#3B6FF6' : '#E2DED7' }}
    >
      <span
        className="block rounded-full transition-transform"
        style={{
          width: s.knob,
          height: s.knob,
          background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,.2)',
          transform: `translateX(${checked ? s.width - s.knob - s.pad * 2 : 0}px)`,
        }}
      />
    </button>
  )
}
