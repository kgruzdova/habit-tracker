export function Checkbox({
  checked,
  onChange,
  color,
  label,
  size = 26,
}: {
  checked: boolean
  onChange: () => void
  color?: string
  label: string
  size?: number
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      style={{
        width: size,
        height: size,
        flex: 'none',
        borderRadius: size > 24 ? 9 : 7,
        border: `2px solid ${checked ? (color ?? 'var(--accent)') : 'var(--border-strong)'}`,
        background: checked ? (color ?? 'var(--accent)') : 'transparent',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 150ms var(--ease)',
      }}
    >
      {checked && (
        <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 12.5l5.2 5.2L20 7"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}
