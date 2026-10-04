import type { InputHTMLAttributes } from 'react'

export function TextField({
  label,
  hint,
  error,
  icon,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: string
  error?: string | null
  icon?: 'user' | 'lock' | 'mail'
}) {
  return (
    <div className="field">
      <label className="label" htmlFor={props.id}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {icon && (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: 13,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--muted)',
              display: 'inline-flex',
            }}
          >
            <FieldIcon name={icon} />
          </span>
        )}
        <input
          {...props}
          className="input"
          style={icon ? { paddingLeft: 42 } : undefined}
        />
      </div>
      {error ? (
        <span className="hint" style={{ color: 'var(--danger)' }}>
          {error}
        </span>
      ) : hint ? (
        <span className="hint">{hint}</span>
      ) : null}
    </div>
  )
}

function FieldIcon({ name }: { name: 'user' | 'lock' | 'mail' }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  if (name === 'user') {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
      </svg>
    )
  }
  if (name === 'mail') {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m3.5 7 8.5 6 8.5-6" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <rect x="4" y="10" width="16" height="11" rx="3" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  )
}
