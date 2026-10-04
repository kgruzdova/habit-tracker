import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../store/context'
import { Checkbox } from '../components/Checkbox'
import { ProgressBar, ProgressRing } from '../components/Progress'
import { IconBadge, Flame, Icon } from '../components/Icons'
import { EmptyState } from '../components/Modal'
import { Modal } from '../components/Modal'
import {
  formatFullDate,
  greeting,
  lastNDays,
  pluralRu,
  relativeDayLabel,
  todayKey,
  weekdayShort,
} from '../lib/dates'
import { frequencyLabel, isScheduledFor } from '../lib/frequency'
import { getStreak, skipInfo, weeklySeries, dailySummaries } from '../lib/stats'
import { BetterThanYesterday } from '../components/BetterThanYesterday'
import { BenefitsBlock } from '../components/BenefitsBlock'

export default function Today() {
  const { data, isDone, toggleCompletion, consumeSkip } = useApp()
  const today = todayKey()
  const [historyFor, setHistoryFor] = useState<string | null>(null)

  const active = useMemo(
    () => data.habits.filter((h) => !h.archived),
    [data.habits],
  )
  const todaysHabits = useMemo(() => {
    return active.filter((h) => {
      if (!isScheduledFor(h, today)) return false
      return true
    })
  }, [active, today])

  const doneCount = todaysHabits.filter((h) => isDone(h.id, today)).length
  const total = todaysHabits.length
  const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100)
  const allDone = total > 0 && doneCount === total

  const week = useMemo(() => {
    const summaries = dailySummaries(data, lastNDays(7))
    return summaries.map((s) => ({
      key: s.key,
      percent: s.percent,
      day: weekdayShort(s.key),
    }))
  }, [data])

  const historyHabit = historyFor ? active.find((h) => h.id === historyFor) ?? null : null
  const pastDays = useMemo(() => lastNDays(14).slice(0, 13).reverse(), [])
  const historyMonth = historyHabit ? weeklySeries(historyHabit, isDone, 4) : []

  return (
    <>
      <div className="page-head">
        <div className="stack" style={{ gap: 4 }}>
          <span className="t-sm muted">{formatFullDate(today)}</span>
          <h1 className="t-h1">
            {greeting()}, {data.settings.name} 👋
          </h1>
        </div>
        <Link to="/app/habits/new" className="btn btn-primary">
          <Icon name="plus" />
          Новая привычка
        </Link>
      </div>

      <div className="stack" style={{ gap: 'var(--sp-5)' }}>
        {/* Прогресс дня */}
        <section className="card" aria-label="Прогресс за сегодня">
          <div className="row" style={{ gap: 'var(--sp-5)', flexWrap: 'wrap' }}>
            <ProgressRing percent={percent} size={92} stroke={9}>
              <div className="stack" style={{ gap: 0, alignItems: 'center' }}>
                <strong className="num" style={{ fontSize: 22, lineHeight: 1 }}>
                  {doneCount}
                </strong>
                <span className="t-xs muted">из {total}</span>
              </div>
            </ProgressRing>
            <div className="grow stack" style={{ gap: 10, minWidth: 180 }}>
              <div>
                <strong className="t-h3">
                  {allDone ? 'День закрыт! 🎉' : total === 0 ? 'На сегодня пусто' : 'День в процессе'}
                </strong>
                <p className="t-sm muted">
                  {total === 0
                    ? 'Добавьте привычку, чтобы начать отслеживать дисциплину.'
                    : allDone
                      ? `Все ${total} ${pluralRu(total, 'привычка', 'привычки', 'привычек')} выполнены.`
                      : `Осталось ${total - doneCount} ${pluralRu(total - doneCount, 'отметка', 'отметки', 'отметок')}.`}
                </p>
              </div>
              <ProgressBar percent={percent} label="Прогресс за сегодня" />
            </div>
          </div>

          {/* Мини-график за неделю */}
          <div className="row" style={{ gap: 6, marginTop: 'var(--sp-5)' }}>
            {week.map((day) => (
              <div key={day.key} className="stack grow" style={{ gap: 5, minWidth: 0 }}>
                <div
                  title={`${day.key}: ${day.percent}%`}
                  style={{
                    height: 34,
                    borderRadius: 9,
                    background: `color-mix(in srgb, var(--accent) ${Math.max(
                      6,
                      day.percent * 0.9,
                    )}%, var(--surface-2))`,
                  }}
                />
                <span className="t-xs muted" style={{ textAlign: 'center' }}>
                  {day.day}
                </span>
              </div>
            ))}
          </div>
        </section>

        <BetterThanYesterday habits={active} isDone={isDone} />

        {/* Список привычек на сегодня */}
        <section className="card" aria-label="Привычки на сегодня">
          <div className="card-head">
            <h2 className="card-title">
              <Icon name="today" /> Сегодня
            </h2>
            <Link to="/app/habits" className="btn btn-subtle btn-sm">
              Все привычки
              <Icon name="chevronRight" size={15} />
            </Link>
          </div>

          {todaysHabits.length === 0 ? (
            <EmptyState
              icon="🌱"
              title="На сегодня ничего не запланировано"
              text="Создайте первую привычку — и каждый день будет напоминать о дисциплине."
              action={
                <Link to="/app/habits/new" className="btn btn-primary">
                  <Icon name="plus" /> Добавить привычку
                </Link>
              }
            />
          ) : (
            <ul className="stack" style={{ gap: 2 }}>
              {todaysHabits.map((habit) => {
                const done = isDone(habit.id, today)
                const streak = getStreak(habit, isDone)
                const skips = skipInfo(data, habit)
                return (
                  <li key={habit.id}>
                    <div
                      className="habit-row"
                      data-done={done ? 'true' : 'false'}
                    >
                      <Checkbox
                        checked={done}
                        color={habit.color}
                        label={`Отметить «${habit.name}»`}
                        onChange={() => toggleCompletion(habit.id, today)}
                      />
                      <Link
                        to={`/app/stats/${habit.id}`}
                        className="row grow"
                        style={{ gap: 12, minWidth: 0 }}
                      >
                        <IconBadge icon={habit.icon} color={habit.color} />
                        <span className="grow stack" style={{ gap: 2, minWidth: 0 }}>
                          <span className="truncate habit-title" style={{ fontWeight: 650 }}>
                            {habit.name}
                          </span>
                          <span className="t-xs muted truncate">
                            {frequencyLabel(habit)}
                            {habit.reminder ? ` · ⏰ ${habit.reminder}` : ''}
                          </span>
                        </span>
                        {streak.current > 0 && (
                          <span className="chip chip-accent">
                            <Flame size={14} />
                            <span className="num">{streak.current}</span>
                          </span>
                        )}
                        {skips.left < skips.allowance && (
                          <span className="chip chip-warn" title="Использовано пропусков">
                            {skips.left} {skips.left === 1 ? 'пропуск' : 'пропуска'}
                          </span>
                        )}
                      </Link>
                      <button
                        className="btn btn-subtle btn-icon hide-sm"
                        onClick={() => setHistoryFor(habit.id)}
                        aria-label="История выполнения"
                        title="Отметить за прошлые дни"
                      >
                        <Icon name="calendar" size={17} />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <BenefitsBlock habits={active} isDone={isDone} />
      </div>

      <Modal
        open={Boolean(historyHabit)}
        title={historyHabit ? `История: ${historyHabit.name}` : ''}
        onClose={() => setHistoryFor(null)}
      >
        {historyHabit && (
          <div className="stack" style={{ gap: 'var(--sp-5)' }}>
            <div className="stack" style={{ gap: 6 }}>
              <span className="label">Последние 14 дней</span>
              <div className="row" style={{ gap: 4, flexWrap: 'wrap' }}>
                {pastDays.map((day) => {
                  const done = isDone(historyHabit.id, day)
                  const planned = isScheduledFor(historyHabit, day)
                  return (
                    <button
                      key={day}
                      onClick={() => toggleCompletion(historyHabit.id, day)}
                      title={`${relativeDayLabel(day)} — ${done ? 'выполнено' : 'не выполнено'}`}
                      style={{
                        flex: '1 1 34px',
                        minWidth: 34,
                        height: 40,
                        borderRadius: 10,
                        border: `1px solid ${done ? 'transparent' : 'var(--border)'}`,
                        background: done
                          ? historyHabit.color
                          : planned
                            ? 'var(--surface-2)'
                            : 'transparent',
                        opacity: planned ? 1 : 0.4,
                        color: done ? '#fff' : 'var(--muted)',
                        fontSize: 10.5,
                        fontWeight: 700,
                      }}
                    >
                      {weekdayShort(day)}
                    </button>
                  )
                })}
              </div>
              <span className="hint">Нажмите на день, чтобы исправить отметку.</span>
            </div>

            <hr className="divider" />

            <div className="stack" style={{ gap: 6 }}>
              <span className="label">Пропуск на сегодня</span>
              <p className="t-sm muted">
                {(() => {
                  const skips = skipInfo(data, historyHabit)
                  return `Можно пропустить ${skips.allowance} ${pluralRu(
                    skips.allowance,
                    'раз',
                    'раза',
                    'раз',
                  )} в ${skips.monthLabel}. Осталось: ${skips.left}.`
                })()}
              </p>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  consumeSkip(historyHabit, today)
                  setHistoryFor(null)
                }}
              >
                Использовать пропуск за сегодня
              </button>
            </div>

            {historyMonth.length > 0 && (
              <div className="stack" style={{ gap: 6 }}>
                <span className="label">Последние недели</span>
                <div className="row" style={{ gap: 8 }}>
                  {historyMonth.map((w) => (
                    <div key={w.label} className="grow stack" style={{ gap: 4, minWidth: 0 }}>
                      <div className="bar bar-sm">
                        <div className="bar-fill bar-sm" style={{ width: `${w.percent}%` }} />
                      </div>
                      <span className="t-xs muted" style={{ textAlign: 'center' }}>
                        {w.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}
