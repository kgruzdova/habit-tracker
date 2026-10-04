export interface SeriesPoint {
  label: string
  value: number | null
}

/** Столбчатая диаграмма выполнения в процентах. */
export function BarChart({
  data,
  height = 150,
  max = 100,
  color = 'var(--accent)',
}: {
  data: SeriesPoint[]
  height?: number
  max?: number
  color?: string
}) {
  if (!data.length) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))`,
          gap: 3,
          height,
          alignItems: 'end',
        }}
      >
        {data.map((point) => {
          const ratio = point.value === null ? 0 : Math.max(0, Math.min(1, point.value / max))
          return (
            <div
              key={point.label}
              title={`${point.label}: ${point.value === null ? '—' : `${point.value}%`}`}
              style={{
                height: `${Math.max(ratio * 100, point.value ? 3 : 1)}%`,
                borderRadius: '5px 5px 3px 3px',
                background:
                  point.value === null
                    ? 'var(--surface-3)'
                    : `color-mix(in srgb, ${color} ${20 + ratio * 80}%, var(--surface-2))`,
                transition: 'height 400ms var(--ease)',
              }}
            />
          )
        })}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))`,
          gap: 3,
        }}
      >
        {data.map((point, i) => {
          if (!(data.length <= 10 || i % 2 === 0)) return <div key={i} />
          const sp = point.label.indexOf(' ')
          const main = sp === -1 ? point.label : point.label.slice(0, sp)
          const rest = sp === -1 ? '' : point.label.slice(sp)
          return (
            <div
              key={i}
              className="t-xs muted"
              style={{ textAlign: 'center', whiteSpace: 'nowrap', overflow: 'visible' }}
            >
              {main}
              {rest !== '' && <span className="bar-lbl-mon">{rest}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Линия с точками — для динамики по дням. */
export function Sparkline({
  data,
  height = 56,
  color = 'var(--accent)',
}: {
  data: number[]
  height?: number
  color?: string
}) {
  if (data.length < 2) return null
  const max = Math.max(...data, 1)
  const step = 100 / (data.length - 1)
  const points = data.map((value, i) => `${i * step},${100 - (value / max) * 92 - 4}`)
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ width: '100%', height, overflow: 'visible' }}
      aria-hidden="true"
    >
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Горизонтальные полосы — для рейтинга привычек. */
export function RankBars({
  items,
}: {
  items: { label: string; value: number; color: string; icon?: string }[]
}) {
  if (!items.length) return null
  const max = Math.max(...items.map((i) => i.value), 1)
  return (
    <div className="stack" style={{ gap: 12 }}>
      {items.map((item) => (
        <div key={item.label} className="stack" style={{ gap: 6 }}>
          <div className="row-between t-sm">
            <span className="row" style={{ gap: 8, minWidth: 0 }}>
              {item.icon && <span aria-hidden="true">{item.icon}</span>}
              <span className="truncate">{item.label}</span>
            </span>
            <span className="num muted" style={{ flex: 'none' }}>
              {item.value}%
            </span>
          </div>
          <div className="bar bar-sm">
            <div
              className="bar-fill bar-sm"
              style={{
                width: `${(item.value / max) * 100}%`,
                background: `color-mix(in srgb, ${item.color} 85%, var(--accent))`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Кольцевой показатель для «пользы». */
export function Donut({
  percent,
  size = 92,
  stroke = 10,
  color = 'var(--accent)',
  children,
}: {
  percent: number
  size?: number
  stroke?: number
  color?: string
  children?: React.ReactNode
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, percent))
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * clamped) / 100}
          style={{ transition: 'stroke-dashoffset 600ms var(--ease)' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        {children}
      </div>
    </div>
  )
}
