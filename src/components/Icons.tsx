import type { ReactNode } from 'react'

export function IconBadge({
  icon,
  color,
  size = 40,
  radius = 13,
}: {
  icon: string
  color: string
  size?: number
  radius?: number
}) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        flex: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radius,
        background: `color-mix(in srgb, ${color} 16%, transparent)`,
        fontSize: Math.round(size * 0.5),
        lineHeight: 1,
      }}
    >
      {icon}
    </span>
  )
}

export function Flame({ size = 18, active = true }: { size?: number; active?: boolean }) {
  const color = active ? 'var(--accent)' : 'var(--muted)'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ color, flex: 'none' }}
      aria-hidden="true"
    >
      <path
        d="M12 2.5s.9 3.2-1.4 5.6C8.3 10.6 6 12 6 15a6 6 0 1 0 12 0c0-2.4-1.1-3.7-2-5-.8 1.2-1.8 1.7-2.6 1.7.9-2.6.2-6.7-1.4-9.2Z"
        fill="currentColor"
        opacity={active ? 1 : 0.45}
      />
    </svg>
  )
}

export function Bolt({ size = 18, color = 'var(--warn)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"
        fill="currentColor"
        style={{ color }}
      />
    </svg>
  )
}

export function Icon({ name, size = 18 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flex: 'none' }}
    >
      {ICONS[name]?.(size) ?? null}
    </svg>
  )
}

const ICONS: Record<string, (size: number) => ReactNode> = {
  today: () => (
    <>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </>
  ),
  list: () => (
    <>
      <path d="M8 6h13M8 12h13M8 18h13" />
      <circle cx="3.5" cy="6" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="3.5" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="3.5" cy="18" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  categories: () => (
    <>
      <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
    </>
  ),
  calendar: () => (
    <>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M3 10h18" />
      <path d="M8 14h2M14 14h2M8 17.5h2M14 17.5h2" />
    </>
  ),
  stats: () => (
    <>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </>
  ),
  settings: () => (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" />
    </>
  ),
  plus: () => <path d="M12 5v14M5 12h14" />,
  burger: () => <path d="M4 7h16M4 12h16M4 17h16" />,
  close: () => <path d="M6 6l12 12M18 6 6 18" />,
  back: () => <path d="M15 5l-7 7 7 7" />,
  edit: () => (
    <>
      <path d="M4 20h4L20 8l-4-4L4 16v4Z" />
      <path d="M14 6l4 4" />
    </>
  ),
  trash: () => (
    <>
      <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  archive: () => (
    <>
      <rect x="3" y="4" width="18" height="4" rx="1.5" />
      <path d="M5 8v11h14V8M10 12h4" />
    </>
  ),
  flame: () => (
    <path
      d="M12 2.5s.9 3.2-1.4 5.6C8.3 10.6 6 12 6 15a6 6 0 1 0 12 0c0-2.4-1.1-3.7-2-5-.8 1.2-1.8 1.7-2.6 1.7.9-2.6.2-6.7-1.4-9.2Z"
      fill="currentColor"
      stroke="none"
    />
  ),
  download: () => (
    <>
      <path d="M12 3v12M7 11l5 5 5-5" />
      <path d="M4 20h16" />
    </>
  ),
  check: () => <path d="M4 12.5l5.2 5.2L20 7" />,
  sun: () => (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" />
    </>
  ),
  moon: () => <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />,
  logout: () => (
    <>
      <path d="M10 4H5v16h5" />
      <path d="M14 8l4 4-4 4M18 12H9" />
    </>
  ),
  chevronLeft: () => <path d="M14 6l-6 6 6 6" />,
  chevronRight: () => <path d="M10 6l6 6-6 6" />,
  spark: () => (
    <path
      d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"
      fill="currentColor"
      stroke="none"
    />
  ),
  lock: () => (
    <>
      <rect x="4" y="10" width="16" height="11" rx="3" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  mail: () => (
    <>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </>
  ),
  user: () => (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
    </>
  ),
  flameSmall: () => (
    <path
      d="M12 2.5s.9 3.2-1.4 5.6C8.3 10.6 6 12 6 15a6 6 0 1 0 12 0c0-2.4-1.1-3.7-2-5-.8 1.2-1.8 1.7-2.6 1.7.9-2.6.2-6.7-1.4-9.2Z"
      fill="currentColor"
      stroke="none"
    />
  ),
}
