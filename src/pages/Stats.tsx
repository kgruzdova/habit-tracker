import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../store/context'
import {
  bestDay,
  bestMonth,
  bestWeek,
  dailySummaries,
  lifetimeStats,
  topHabits,
} from '../lib/stats'
import { BarChart, Donut, RankBars } from '../components/Charts'
import { Icon, IconBadge } from '../components/Icons'
import { EmptyState } from '../components/Modal'
import { ProgressBar } from '../components/Progress'
import { formatDayMonth, lastNDays, pluralRu } from '../lib/dates'

export default function Stats() {
  const { data } = useApp()

  const life = useMemo(() => lifetimeStats(data), [data])
  const ranks = useMemo(() => topHabits(data, 30), [data])
  const month = useMemo(() => dailySummaries(data, lastNDays(30)), [data])
  const day = useMemo(() => bestDay(data), [data])
  const week = useMemo(() => bestWeek(data), [data])
  const best = useMemo(() => bestMonth(data), [data])

  const heat = useMemo(
    () =>
      month.map((s) => ({
        label: formatDayMonth(s.key),
        value: s.planned === 0 ? null : s.percent,
      })),
    [month],
  )

  if (data.habits.length === 0) {
    return (
      <>
        <div className="page-head">
          <h1 className="t-h1">Статистика</h1>
        </div>
        <div className="card">
          <EmptyState
            icon="📊"
            title="Пока нечего считать"
            text="Создайте привычки и отмечайте их — здесь появится подробная статистика."
            action={
              <Link to="/app/habits/new" className="btn btn-primary">
                <Icon name="plus" /> Новая привычка
              </Link>
            }
          />
        </div>
      </>
    )
  }

  return (
    <>
      <div className="page-head">
        <div className="stack" style={{ gap: 4 }}>
          <h1 className="t-h1">Общая статистика</h1>
          <p className="t-sm muted">Активность за всё время и ваши лучшие периоды.</p>
        </div>
        <Link to="/app/calendar" className="btn btn-ghost">
          <Icon name="calendar" /> Календарь
        </Link>
      </div>

      <div className="stack" style={{ gap: 'var(--sp-5)' }}>
        <section className="grid grid-4">
          <Tile label="Всего отметок" value={life.totalMarks} icon="✅" />
          <Tile label="Активных привычек" value={life.activeHabits} icon="🎯" />
          <Tile label="Дней подряд (рекорд)" value={life.longestStreakOverall} icon="🔥" />
          <Tile
            label="Выполнение за 30 дней"
            value={`${life.overallPercent}%`}
            icon="📈"
          />
        </section>

        <section className="card">
          <div className="card-head">
            <h2 className="card-title">
              <Icon name="stats" /> Активность за 30 дней
            </h2>
            <span className="chip">по дням</span>
          </div>
          <BarChart data={heat} height={170} />
        </section>

        <div className="grid grid-2">
          <section className="card">
            <div className="card-head">
              <h2 className="card-title">Самые успешные привычки</h2>
            </div>
            {ranks.length === 0 ? (
              <p className="t-sm muted">Активных привычек нет.</p>
            ) : (
              <RankBars
                items={ranks.slice(0, 6).map((r) => ({
                  label: r.habit.name,
                  value: r.percent,
                  color: r.habit.color,
                  icon: r.habit.icon,
                }))}
              />
            )}
            {life.archivedHabits > 0 && (
              <p className="t-xs muted" style={{ marginTop: 'var(--sp-4)' }}>
                В архиве: {life.archivedHabits}{' '}
                {pluralRu(life.archivedHabits, 'привычка', 'привычки', 'привычек')}
              </p>
            )}
          </section>

          <section className="card">
            <div className="card-head">
              <h2 className="card-title">Лучшие периоды</h2>
            </div>
            <div className="stack" style={{ gap: 'var(--sp-4)' }}>
              <PeriodRow title="Лучший день" value={day?.label ?? '—'} detail={day?.detail ?? 'нет данных'} percent={day?.percent ?? 0} />
              <PeriodRow title="Лучшая неделя" value={week?.label ?? '—'} detail={week?.detail ?? 'нет данных'} percent={week?.percent ?? 0} />
              <PeriodRow title="Лучший месяц" value={best?.label ?? '—'} detail={best?.detail ?? 'нет данных'} percent={best?.percent ?? 0} />
            </div>
          </section>
        </div>

        <section className="card">
          <div className="card-head">
            <h2 className="card-title">Привычки</h2>
            <Link to="/app/habits" className="btn btn-subtle btn-sm">
              Все привычки
              <Icon name="chevronRight" size={15} />
            </Link>
          </div>
          <div className="grid grid-2">
            {data.habits
              .filter((h) => !h.archived)
              .map((habit) => {
                const rank = ranks.find((r) => r.habit.id === habit.id)
                const percent = rank?.percent ?? 0
                const done = rank?.done ?? 0
                return (
                  <Link
                    key={habit.id}
                    to={`/app/stats/${habit.id}`}
                    className="card-flat card-pad-sm hover-lift"
                    style={{ display: 'block' }}
                  >
                    <div className="row" style={{ gap: 12, marginBottom: 'var(--sp-3)' }}>
                      <IconBadge icon={habit.icon} color={habit.color} size={38} radius={12} />
                      <div className="grow stack" style={{ gap: 0, minWidth: 0 }}>
                        <strong className="truncate t-sm">{habit.name}</strong>
                        <span className="t-xs muted">
                          {done} {pluralRu(done, 'отметка', 'отметки', 'отметок')} за 30 дней
                        </span>
                      </div>
                      <Donut percent={percent} size={46} stroke={6} color={habit.color}>
                        <span className="num" style={{ fontSize: 12, fontWeight: 700 }}>
                          {percent}
                        </span>
                      </Donut>
                    </div>
                    <ProgressBar percent={percent} size="sm" label={`${habit.name}: ${percent}%`} />
                  </Link>
                )
              })}
          </div>
        </section>

        <p className="t-xs muted">
          Отслеживание ведётся с {life.daysTracked}{' '}
          {pluralRu(life.daysTracked, 'дня', 'дней', 'дней')}.
        </p>
      </div>
    </>
  )
}

function Tile({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div className="card" style={{ padding: 'var(--sp-4)' }}>
      <div className="row-between" style={{ alignItems: 'flex-start' }}>
        <div className="stack" style={{ gap: 2, minWidth: 0 }}>
          <span className="num" style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1 }}>
            {value}
          </span>
          <span className="t-xs muted">{label}</span>
        </div>
        <span aria-hidden="true" style={{ fontSize: 20, opacity: 0.7 }}>
          {icon}
        </span>
      </div>
    </div>
  )
}

function PeriodRow({
  title,
  value,
  detail,
  percent,
}: {
  title: string
  value: string
  detail: string
  percent: number
}) {
  return (
    <div className="stack" style={{ gap: 6 }}>
      <div className="row-between t-sm">
        <span className="muted">{title}</span>
        <span className="num" style={{ fontWeight: 700 }}>
          {percent}%
        </span>
      </div>
      <ProgressBar percent={percent} size="sm" label={title} />
      <div className="row-between t-xs muted">
        <span>{value}</span>
        <span>{detail}</span>
      </div>
    </div>
  )
}
