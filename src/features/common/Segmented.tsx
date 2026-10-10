'use client'

type Props<T extends string> = {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  label: string
  // Track colour: a shade darker than whatever it sits on.
  track?: string
}

// Equal-width segmented control with a white pill on the selected option.
export default function Segmented<T extends string>({ options, value, onChange, label, track = '#F6F3EE' }: Props<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid gap-1 rounded-[12px] p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`, background: track }}
    >
      {options.map(o => {
        const selected = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(o.value)}
            className="text-center py-[7px] rounded-[9px] text-[12px] transition-colors"
            style={selected
              ? { background: '#fff', color: '#20242E', fontWeight: 800, boxShadow: '0 1px 3px rgba(32,36,46,.08)' }
              : { color: '#787D87', fontWeight: 700 }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
