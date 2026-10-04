import { useMemo, useState } from 'react'
import { useApp } from '../store/context'
import { dailySummaries, monthGrid } from '../lib/stats'
import {
  formatMonthYear,
  fromKey,
  monthKey,
  shiftKey,
  todayKey,
  WEEKDAY_LABELS,
} from '../lib/dates'
import { isScheduledFor } from '../lib/frequency'
import { Icon } from '../components/Icons'
import { Modal } from '../components/Modal'
import { ProgressBar } from '../components/Progress'

function heatColor(done: number, planned: number): string {
  if (planned === 0) return 'var(--surface-2)'
  const ratio = done / planned
  if (ratio <= 0) return 'var(--heat-0)'
  if (ratio <= 0.34) return 'var(--heat-1)'
  if (ratio <= 0.66) return 'var(--heat-2)'
  if (ratio < 1) return 'var(--heat-3)'
  return 'var(--heat-4)'
}

export default function CalendarPage() {
  const { data, isDone, toggleCompletion } = useApp()
  const today = todayKey()
  const [anchor, setAnchor] = useState(today)
  const [selected, setSelected] = useState<string | null>(null)

  const cells = useMemo(() => monthGrid(anchor), [anchor])
  const summaries = useMemo(
    () => dailySummaries(data, cells.filter((c): c is string => Boolean(c))),
    [data, cells],
  )
  const summaryMap = useMemo(
    () => new Map(summaries.map((s) => [s.key, s])),
    [summaries],
  )

  const monthDone = summaries.reduce((sum, s) => sum + s.done, 0)
  const monthPlanned = summaries.reduce((sum, s) => sum + s.planned, 0)
  const monthPercent = monthPlanned === 0 ? 0 : Math.round((monthDone / monthPlanned) * 100)

  const activeHabits = useMemo(
    () => data.habits.filter((h) => !h.archived),
    [data.habits],
  )

  const selectedHabits = useMemo(() => {
    if (!selected) return []
    return activeHabits
      .filter((h) => isScheduledFor(h, selected))
      .map((habit) => ({ habit, done: isDone(habit.id, selected) }))
  }, [selected, activeHabits, isDone])

  const legend = [
    { label: '0', bg: 'var(--heat-0)' },
    { label: 'мало', bg: 'var(--heat-1)' },
    { label: 'средне', bg: 'var(--heat-2)' },
    { label: 'много', bg: 'var(--heat-3)' },
    { label: 'всё', bg: 'var(--heat-4)' },
  ]

  return (
    <>
      <div className="page-head">
        <div className="stack" style={{ gap: 4 }}>
          <h1 className="t-h1">Календарь и история</h1>
          <p className="t-sm muted">
            Тепловая карта показывает, сколько привычек выполнено в каждый день. Нажмите на день,
            чтобы исправить отметки.
          </p>
        </div>
        <div className="row" style={{ gap: 'var(--sp-2)' }}>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setAnchor(shiftKey(anchor, -28))}
            aria-label="Предыдущий месяц"
          >
            <Icon name="chevronLeft" />
          </button>
          <span className="chip" style={{ minWidth: 108, justifyContent: 'center' }}>
            {formatMonthYear(anchor)}
          </span>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setAnchor(shiftKey(anchor, 28))}
            aria-label="Следующий месяц"
          >
            <Icon name="chevronRight" />
          </button>
        </div>
      </div>

      <div className="stack" style={{ gap: 'var(--sp-4)' }}>
        <section className="card">
          <div className="card-head">
            <h2 className="card-title">
              <Icon name="calendar" /> {formatMonthYear(anchor)}
            </h2>
            <button
              className="btn btn-subtle btn-sm"
              onClick={() => setAnchor(today)}
              disabled={anchor === today}
            >
              Сегодня
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
              gap: 6,
              marginBottom: 6,
            }}
          >
            {WEEKDAY_LABELS.map((label, i) => (
              <div key={label} className="t-xs muted" style={{ textAlign: 'center', fontWeight: 700 }}>
                {i === 0 ? 'пн' : label}
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
              gap: 6,
            }}
          >
            {cells.map((cell, i) => {
              if (!cell) return <div key={`empty-${i}`} style={{ aspectRatio: '1' }} />
              const summary = summaryMap.get(cell)
              const planned = summary?.planned ?? 0
              const done = summary?.done ?? 0
              const isToday = cell === today
              const isFuture = cell > today
              const date = fromKey(cell)
              return (
                <button
                  key={cell}
                  onClick={() => setSelected(cell)}
                  disabled={isFuture}
                  title={`${cell}: ${done} из ${planned}`}
                  style={{
                    aspectRatio: '1',
                    minHeight: 40,
                    borderRadius: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    background: heatColor(done, planned),
                    border: isToday ? '2px solid var(--accent)' : '1px solid transparent',
                    color: planned > 0 && done / planned >= 0.66 ? '#fff' : 'var(--text-2)',
                    opacity: isFuture ? 0.35 : 1,
                    cursor: isFuture ? 'not-allowed' : 'pointer',
                  }}
                >
                  <span className="num" style={{ fontSize: 13, fontWeight: 700 }}>
                    {date.getDate()}
                  </span>
                  {planned > 0 && (
                    <span style={{ fontSize: 10, opacity: 0.85 }}>
                      {done}/{planned}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="row" style={{ gap: 6, marginTop: 'var(--sp-4)', flexWrap: 'wrap' }}>
            <span className="t-xs muted">Меньше</span>
            {legend.map((item) => (
              <span
                key={item.label}
                className="t-xs muted"
                title={item.label}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 6,
                  background: item.bg,
                  display: 'inline-flex',
                }}
              />
            ))}
            <span className="t-xs muted">Больше</span>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <h2 className="card-title">Итоги месяца</h2>
            <span className="chip chip-accent">{monthPercent}%</span>
          </div>
          <div className="stack" style={{ gap: 'var(--sp-4)' }}>
            <ProgressBar percent={monthPercent} label="Выполнение за месяц" />
            <div className="grid grid-3">
              <Stat label="Отметок" value={monthDone} />
              <Stat label="Запланировано" value={monthPlanned} />
              <Stat label="Дней в месяце" value={summaries.filter((s) => s.planned > 0).length} />
            </div>
          </div>
        </section>
      </div>

      <Modal
        open={Boolean(selected)}
        title={selected ? fromKey(selected).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' }) : ''}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <div className="stack" style={{ gap: 'var(--sp-4)' }}>
            {selectedHabits.length === 0 ? (
              <p className="t-sm muted">
                На этот день не было запланированных привычек. Можно отметить выполнение вручную в
                разделе «Сегодня».
              </p>
            ) : (
              <ul className="stack" style={{ gap: 2 }}>
                {selectedHabits.map(({ habit, done }) => (
                  <li key={habit.id}>
                    <button
                      className="habit-row"
                      onClick={() => toggleCompletion(habit.id, selected)}
                      style={{ width: '100%', textAlign: 'left' }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 9,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: done ? habit.color : 'var(--surface-2)',
                          border: `2px solid ${done ? habit.color : 'var(--border-strong)'}`,
                          color: '#fff',
                          flex: 'none',
                        }}
                      >
                        {done && <Icon name="check" size={15} />}
                      </span>
                      <span className="grow stack" style={{ gap: 0, minWidth: 0 }}>
                        <span style={{ fontWeight: 650 }}>{habit.name}</span>
                        <span className="t-xs muted">
                          {done ? 'Выполнено' : 'Не выполнено'}
                        </span>
                      </span>
                      <span aria-hidden="true" style={{ fontSize: 18 }}>
                        {habit.icon}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="t-xs muted">
              Месяц: {monthKey(selected)} · нажмите на привычку, чтобы переключить отметку.
            </p>
          </div>
        )}
      </Modal>
    </>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card-flat card-pad-sm stack" style={{ gap: 2, background: 'var(--surface-2)' }}>
      <span className="num" style={{ fontSize: 22, fontWeight: 800 }}>
        {value}
      </span>
      <span className="t-xs muted">{label}</span>
    </div>
  )
}
