import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useApp } from '../store/context'
import {
  dailySeries,
  dailySummaries,
  getStreak,
  last7,
  last15,
  last30,
  skipInfo,
  totalDone,
  weekCompletionText,
  weeklySeries,
} from '../lib/stats'
import { BarChart } from '../components/Charts'
import { Flame, Icon, IconBadge } from '../components/Icons'
import { ProgressBar, ProgressRing } from '../components/Progress'
import {
  formatDayMonth,
  formatFullDate,
  lastNDays,
  pluralRu,
  todayKey,
  weekdayShort,
} from '../lib/dates'
import { frequencyLabel, isScheduledFor } from '../lib/frequency'

export default function HabitStats() {
  const { id } = useParams()
  const { data, isDone } = useApp()
  const habit = useMemo(() => data.habits.find((h) => h.id === id) ?? null, [id, data.habits])

  const stats = useMemo(() => {
    if (!habit) return null
    const days30 = lastNDays(30)
    return {
      streak: getStreak(habit, isDone),
      s7: last7(habit, isDone),
      s15: last15(habit, isDone),
      s30: last30(habit, isDone),
      total: totalDone(habit, isDone),
      series: dailySeries(habit, isDone, days30).map((value, i) => ({
        label: weekdayShort(days30[i]),
        value,
      })),
      weeks: weeklySeries(habit, isDone, 8),
      weekText: weekCompletionText(habit, isDone),
      skips: skipInfo(data, habit),
    }
  }, [habit, isDone, data])

  const heat = useMemo(() => {
    if (!habit) return []
    return dailySummaries(data, lastNDays(30)).map((s) => ({
      label: formatDayMonth(s.key),
      value: isScheduledFor(habit, s.key) ? (isDone(habit.id, s.key) ? 100 : 0) : null,
    }))
  }, [habit, data, isDone])

  if (!habit || !stats) {
    return (
      <>
        <div className="page-head">
          <h1 className="t-h1">Привычка не найдена</h1>
        </div>
        <div className="card stack" style={{ gap: 'var(--sp-4)', alignItems: 'flex-start' }}>
          <p className="t-body">Возможно, она была удалена. Вернитесь к списку привычек.</p>
          <Link to="/app/habits" className="btn btn-primary">
            <Icon name="back" size={16} /> К списку привычек
          </Link>
        </div>
      </>
    )
  }

  const category = data.categories.find((c) => c.id === habit.categoryId)

  return (
    <>
      <div className="page-head">
        <div className="stack" style={{ gap: 6 }}>
          <Link to="/app/habits" className="btn btn-subtle btn-sm" style={{ alignSelf: 'flex-start' }}>
            <Icon name="back" size={15} /> К списку
          </Link>
          <div className="row" style={{ gap: 'var(--sp-4)' }}>
            <IconBadge icon={habit.icon} color={habit.color} size={52} radius={16} />
            <div className="stack" style={{ gap: 2 }}>
              <h1 className="t-h1">{habit.name}</h1>
              <p className="t-sm muted">
                {frequencyLabel(habit)}
                {habit.reminder ? ` · ⏰ ${habit.reminder}` : ''}
                {category ? ` · ${category.icon} ${category.name}` : ''}
                {habit.unit ? ` · цель: ${habit.unit}` : ''}
              </p>
            </div>
          </div>
        </div>
        <Link to={`/app/habits/${habit.id}/edit`} className="btn btn-ghost">
          <Icon name="edit" size={16} /> Редактировать
        </Link>
      </div>

      <div className="stack" style={{ gap: 'var(--sp-5)' }}>
        <section className="grid grid-4">
          <div className="card" style={{ padding: 'var(--sp-4)' }}>
            <div className="stack" style={{ gap: 6 }}>
              <span className="row" style={{ gap: 6, color: 'var(--accent)' }}>
                <Flame size={18} />
                <span className="t-xs muted">Текущая серия</span>
              </span>
              <span className="num" style={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }}>
                {stats.streak.current}
              </span>
              <span className="t-xs muted">{pluralRu(stats.streak.current, 'день', 'дня', 'дней')} подряд</span>
            </div>
          </div>

          <div className="card" style={{ padding: 'var(--sp-4)' }}>
            <div className="stack" style={{ gap: 6 }}>
              <span className="t-xs muted">Лучшая серия</span>
              <span className="num" style={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }}>
                {stats.streak.best}
              </span>
              <span className="t-xs muted">рекорд за всё время</span>
            </div>
          </div>

          <div className="card" style={{ padding: 'var(--sp-4)' }}>
            <div className="stack" style={{ gap: 6 }}>
              <span className="t-xs muted">Всего выполнено</span>
              <span className="num" style={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }}>
                {stats.total}
              </span>
              <span className="t-xs muted">{pluralRu(stats.total, 'отметка', 'отметки', 'отметок')}</span>
            </div>
          </div>

          <div className="card row" style={{ padding: 'var(--sp-4)', gap: 'var(--sp-4)' }}>
            <ProgressRing percent={stats.s30.percent} size={62} stroke={7}>
              <span className="num" style={{ fontSize: 13, fontWeight: 700 }}>
                {stats.s30.percent}%
              </span>
            </ProgressRing>
            <div className="stack" style={{ gap: 2 }}>
              <span className="t-xs muted">За 30 дней</span>
              <strong className="t-sm">
                {stats.s30.done} из {stats.s30.planned}
              </strong>
              <span className="t-xs muted">{stats.weekText}</span>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <h2 className="card-title">Процент выполнения</h2>
          </div>
          <div className="grid grid-3">
            {[stats.s7, stats.s15, stats.s30].map((stat, i) => {
              const labels = ['7 дней', '15 дней', '30 дней']
              return (
                <div key={labels[i]} className="stack" style={{ gap: 8 }}>
                  <div className="row-between t-sm">
                    <span className="muted">За {labels[i]}</span>
                    <span className="num" style={{ fontWeight: 700 }}>
                      {stat.percent}%
                    </span>
                  </div>
                  <ProgressBar percent={stat.percent} label={`За ${labels[i]}`} />
                  <span className="t-xs muted">
                    {stat.done} из {stat.planned} {pluralRu(stat.planned, 'день', 'дня', 'дней')}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <h2 className="card-title">Выполнение по дням</h2>
            <span className="chip">последние 30 дней</span>
          </div>
          <BarChart data={heat} height={150} color={habit.color} />
        </section>

        <section className="card">
          <div className="card-head">
            <h2 className="card-title">Выполнение по неделям</h2>
            <span className="chip">8 недель</span>
          </div>
          <BarChart
            data={stats.weeks.map((w) => ({ label: w.label, value: w.percent }))}
            height={140}
            color={habit.color}
          />
        </section>

        <section className="grid grid-2">
          <div className="card">
            <div className="card-head">
              <h2 className="card-title">Пропуски</h2>
            </div>
            <div className="stack" style={{ gap: 10 }}>
              <p className="t-body">
                В {stats.skips.monthLabel} использовано{' '}
                <strong>
                  {stats.skips.used} из {stats.skips.allowance}
                </strong>{' '}
                разрешённых пропусков.
              </p>
              <ProgressBar
                percent={
                  stats.skips.allowance === 0
                    ? 0
                    : Math.min(100, (stats.skips.used / stats.skips.allowance) * 100)
                }
                label="Использовано пропусков"
              />
              <span className="t-sm muted">
                {stats.skips.left === 0
                  ? 'Лимит исчерпан — дальше каждый день засчитывается.'
                  : `Осталось ${stats.skips.left} ${pluralRu(stats.skips.left, 'пропуск', 'пропуска', 'пропусков')}.`}
              </span>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h2 className="card-title">Детали</h2>
            </div>
            <dl className="stack" style={{ gap: 10 }}>
              <Detail label="Периодичность" value={frequencyLabel(habit)} />
              <Detail label="Напоминание" value={habit.reminder ? `⏰ ${habit.reminder}` : 'нет'} />
              <Detail label="Единица измерения" value={habit.unit ?? '—'} />
              <Detail label="Создана" value={formatFullDate(habit.createdAt)} />
              <Detail label="Статус" value={habit.archived ? 'В архиве' : 'Активна'} />
              <Detail label="Сегодня" value={isDone(habit.id, todayKey()) ? 'Выполнено' : 'Не выполнено'} />
            </dl>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <h2 className="card-title">Последние дни</h2>
          </div>
          <div className="row" style={{ gap: 4, flexWrap: 'wrap' }}>
            {stats.series.map((point, i) => {
              const days = lastNDays(30)
              const key = days[i]
              const planned = isScheduledFor(habit, key)
              return (
                <div
                  key={key}
                  title={`${formatFullDate(key)}: ${
                    point.value === null ? 'не запланировано' : point.value ? 'выполнено' : 'не выполнено'
                  }`}
                  className="stack grow"
                  style={{ gap: 4, minWidth: 22, opacity: planned ? 1 : 0.35 }}
                >
                  <div
                    style={{
                      height: 34,
                      borderRadius: 8,
                      background:
                        point.value === null
                          ? 'var(--surface-2)'
                          : point.value
                            ? habit.color
                            : 'var(--surface-3)',
                    }}
                  />
                  <span className="t-xs muted" style={{ textAlign: 'center' }}>
                    {weekdayShort(key)}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="row-between" style={{ gap: 'var(--sp-4)' }}>
      <dt className="t-sm muted">{label}</dt>
      <dd className="t-sm" style={{ fontWeight: 600, textAlign: 'right' }}>
        {value}
      </dd>
    </div>
  )
}
