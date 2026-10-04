import type { ReactNode } from 'react'

export function ProgressBar({
  percent,
  label,
  size = 'md',
}: {
  percent: number
  label?: string
  size?: 'sm' | 'md'
}) {
  const clamped = Math.max(0, Math.min(100, percent))
  return (
    <div
      className="bar"
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={size === 'sm' ? 'bar-fill bar-sm' : 'bar-fill'}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}

export function ProgressRing({
  percent,
  size = 64,
  stroke = 7,
  children,
}: {
  percent: number
  size?: number
  stroke?: number
  children?: ReactNode
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, percent))
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--surface-3)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * clamped) / 100}
          style={{ transition: 'stroke-dashoffset 500ms var(--ease)' }}
        />
      </svg>
      {children !== undefined && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {children}
        </div>
      )}
    </div>
  )
}
