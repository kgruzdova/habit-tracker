import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../store/context'
import type { Frequency, Habit } from '../types'
import { HABIT_COLORS, HABIT_ICONS } from '../lib/storage'
import { Icon } from '../components/Icons'

const WEEKDAYS = [
  { value: 1, label: 'Пн' },
  { value: 2, label: 'Вт' },
  { value: 3, label: 'Ср' },
  { value: 4, label: 'Чт' },
  { value: 5, label: 'Пт' },
  { value: 6, label: 'Сб' },
  { value: 0, label: 'Вс' },
]

type Kind = Frequency['kind']

interface FormState {
  name: string
  note: string
  icon: string
  color: string
  categoryId: string
  kind: Kind
  days: number[]
  times: number
  reminder: string
  unit: string
  skipAllowance: number
}

const emptyForm = (): FormState => ({
  name: '',
  note: '',
  icon: '🎯',
  color: HABIT_COLORS[0],
  categoryId: '',
  kind: 'daily',
  days: [1, 2, 3, 4, 5],
  times: 3,
  reminder: '09:00',
  unit: '',
  skipAllowance: 2,
})

export default function HabitForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, addHabit, updateHabit } = useApp()
  const editing = useMemo(() => (id ? data.habits.find((h) => h.id === id) ?? null : null), [id, data.habits])

  const [form, setForm] = useState<FormState>(() => {
    if (!editing) return emptyForm()
    return {
      name: editing.name,
      note: editing.note ?? '',
      icon: editing.icon,
      color: editing.color,
      categoryId: editing.categoryId ?? '',
      kind: editing.frequency.kind,
      days: editing.frequency.kind === 'weekdays' ? editing.frequency.days : [1, 2, 3, 4, 5],
      times: editing.frequency.kind === 'timesPerWeek' ? editing.frequency.times : 3,
      reminder: editing.reminder ?? '09:00',
      unit: editing.unit ?? '',
      skipAllowance: editing.skipAllowance,
    }
  })

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const toggleDay = (day: number) => {
    set(
      'days',
      form.days.includes(day) ? form.days.filter((d) => d !== day) : [...form.days, day].sort(),
    )
  }

  const errors: Record<string, string> = {}
  if (form.name.trim().length < 2) errors.name = 'Введите название — минимум 2 символа.'
  if (form.kind === 'weekdays' && form.days.length === 0) errors.days = 'Выберите хотя бы один день.'
  if (form.kind === 'timesPerWeek' && (form.times < 1 || form.times > 7))
    errors.times = 'От 1 до 7 раз в неделю.'
  if (form.skipAllowance < 0 || form.skipAllowance > 31)
    errors.skipAllowance = 'От 0 до 31 пропуска в месяц.'

  const valid = Object.keys(errors).length === 0

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    const frequency: Frequency =
      form.kind === 'daily'
        ? { kind: 'daily' }
        : form.kind === 'weekdays'
          ? { kind: 'weekdays', days: form.days }
          : { kind: 'timesPerWeek', times: form.times }

    const payload: Omit<Habit, 'id' | 'createdAt'> = {
      name: form.name.trim(),
      note: form.note.trim() || undefined,
      icon: form.icon,
      color: form.color,
      categoryId: form.categoryId || null,
      frequency,
      reminder: form.reminder || null,
      unit: form.unit.trim() || null,
      skipAllowance: form.skipAllowance,
      archived: editing?.archived ?? false,
    }

    if (editing) {
      updateHabit(editing.id, payload)
      navigate('/app/habits')
    } else {
      addHabit(payload)
      navigate('/app/today')
    }
  }

  return (
    <>
      <div className="page-head">
        <div className="stack" style={{ gap: 4 }}>
          <Link to="/app/habits" className="btn btn-subtle btn-sm" style={{ alignSelf: 'flex-start' }}>
            <Icon name="back" size={15} /> К списку
          </Link>
          <h1 className="t-h1">{editing ? 'Редактирование привычки' : 'Новая привычка'}</h1>
        </div>
      </div>

      <form onSubmit={submit} className="grid" style={{ gridTemplateColumns: 'minmax(0, 1fr)', gap: 'var(--sp-5)' }}>
        <div className="grid grid-2" style={{ alignItems: 'start' }}>
          {/* Основное */}
          <section className="card">
            <div className="card-head">
              <h2 className="card-title">Основное</h2>
            </div>
            <div className="stack" style={{ gap: 'var(--sp-4)' }}>
              <div className="field">
                <label className="label" htmlFor="habit-name">
                  Название
                </label>
                <input
                  id="habit-name"
                  className="input"
                  placeholder="Например: пить воду"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  autoFocus
                />
                {errors.name && <span className="hint" style={{ color: 'var(--danger)' }}>{errors.name}</span>}
              </div>

              <div className="field">
                <label className="label" htmlFor="habit-note">
                  Заметка <span className="muted">(необязательно)</span>
                </label>
                <input
                  id="habit-note"
                  className="input"
                  placeholder="8 стаканов, перед сном"
                  value={form.note}
                  onChange={(e) => set('note', e.target.value)}
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="habit-category">
                  Категория
                </label>
                <select
                  id="habit-category"
                  className="select"
                  value={form.categoryId}
                  onChange={(e) => set('categoryId', e.target.value)}
                >
                  <option value="">Без категории</option>
                  {data.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="label" htmlFor="habit-unit">
                  Единица измерения <span className="muted">(для статистики в виде пользы)</span>
                </label>
                <input
                  id="habit-unit"
                  className="input"
                  placeholder="стаканов, страниц, минут, км"
                  value={form.unit}
                  onChange={(e) => set('unit', e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Иконка и цвет */}
          <section className="card">
            <div className="card-head">
              <h2 className="card-title">Иконка и цвет</h2>
            </div>
            <div className="stack" style={{ gap: 'var(--sp-4)' }}>
              <div
                className="row"
                style={{
                  gap: 'var(--sp-4)',
                  padding: 'var(--sp-4)',
                  borderRadius: 'var(--r-md)',
                  background: `color-mix(in srgb, ${form.color} 12%, transparent)`,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 18,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    background: 'var(--surface)',
                    boxShadow: 'var(--shadow-sm)',
                    flex: 'none',
                  }}
                >
                  {form.icon}
                </span>
                <div className="stack grow" style={{ gap: 2, minWidth: 0 }}>
                  <strong className="truncate">{form.name || 'Новая привычка'}</strong>
                  <span className="t-sm muted">Предпросмотр</span>
                </div>
              </div>

              <div className="field">
                <span className="label">Иконка</span>
                <div className="wrap-row" style={{ gap: 6 }}>
                  {HABIT_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => set('icon', icon)}
                      aria-label={`Иконка ${icon}`}
                      aria-pressed={form.icon === icon}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        fontSize: 19,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: form.icon === icon ? 'var(--accent-soft)' : 'var(--surface-2)',
                        border: `1px solid ${form.icon === icon ? 'var(--accent)' : 'var(--border)'}`,
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <span className="label">Цвет</span>
                <div className="wrap-row" style={{ gap: 8 }}>
                  {HABIT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => set('color', color)}
                      aria-label={`Цвет ${color}`}
                      aria-pressed={form.color === color}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 11,
                        background: color,
                        border: form.color === color ? '2px solid var(--text)' : '2px solid transparent',
                        outline: form.color === color ? '2px solid var(--surface)' : 'none',
                        outlineOffset: -4,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Периодичность */}
        <section className="card">
          <div className="card-head">
            <h2 className="card-title">Периодичность</h2>
          </div>
          <div className="stack" style={{ gap: 'var(--sp-4)' }}>
            <div className="segmented">
              {(
                [
                  ['daily', 'Ежедневно'],
                  ['weekdays', 'По дням недели'],
                  ['timesPerWeek', 'X раз в неделю'],
                ] as const
              ).map(([key, label]) => (
                <button key={key} type="button" aria-pressed={form.kind === key} onClick={() => set('kind', key)}>
                  {label}
                </button>
              ))}
            </div>

            {form.kind === 'weekdays' && (
              <div className="field">
                <span className="label">Дни недели</span>
                <div className="dow">
                  {WEEKDAYS.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      aria-pressed={form.days.includes(day.value)}
                      onClick={() => toggleDay(day.value)}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
                {errors.days && (
                  <span className="hint" style={{ color: 'var(--danger)' }}>{errors.days}</span>
                )}
              </div>
            )}

            {form.kind === 'timesPerWeek' && (
              <div className="field" style={{ maxWidth: 280 }}>
                <label className="label" htmlFor="habit-times">
                  Сколько раз в неделю: <strong className="accent-text">{form.times}</strong>
                </label>
                <input
                  id="habit-times"
                  type="range"
                  min={1}
                  max={7}
                  value={form.times}
                  onChange={(e) => set('times', Number(e.target.value))}
                  style={{ accentColor: 'var(--accent)' }}
                />
                {errors.times && (
                  <span className="hint" style={{ color: 'var(--danger)' }}>{errors.times}</span>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Напоминание и пропуски */}
        <div className="grid grid-2">
          <section className="card">
            <div className="card-head">
              <h2 className="card-title">⏰ Напоминание</h2>
            </div>
            <div className="stack" style={{ gap: 'var(--sp-4)' }}>
              <div className="field">
                <label className="label" htmlFor="habit-reminder">
                  Время напоминания
                </label>
                <input
                  id="habit-reminder"
                  type="time"
                  className="input"
                  value={form.reminder}
                  onChange={(e) => set('reminder', e.target.value)}
                />
                <span className="hint">
                  Напоминание показывается в интерфейсе. Push-уведомления включаются в настройках.
                </span>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-head">
              <h2 className="card-title">🎫 Пропуски</h2>
            </div>
            <div className="stack" style={{ gap: 'var(--sp-4)' }}>
              <div className="field">
                <label className="label" htmlFor="habit-skips">
                  Сколько раз в месяц можно пропустить
                </label>
                <input
                  id="habit-skips"
                  type="number"
                  min={0}
                  max={31}
                  className="input"
                  value={form.skipAllowance}
                  onChange={(e) => set('skipAllowance', Number(e.target.value))}
                />
                <span className="hint">
                  Поблажка не портит серию — вы честно отмечаете, что отдыхали.
                </span>
                {errors.skipAllowance && (
                  <span className="hint" style={{ color: 'var(--danger)' }}>{errors.skipAllowance}</span>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="row" style={{ gap: 'var(--sp-3)', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <Link to="/app/habits" className="btn btn-ghost">
            Отмена
          </Link>
          <button type="submit" className="btn btn-primary" disabled={!valid}>
            {editing ? 'Сохранить изменения' : 'Создать привычку'}
          </button>
        </div>
      </form>
    </>
  )
}
