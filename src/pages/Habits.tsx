import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../store/context'
import { getStreak, skipInfo, weekCompletionText, last30 } from '../lib/stats'
import { frequencyLabel } from '../lib/frequency'
import { Flame, Icon, IconBadge } from '../components/Icons'
import { EmptyState, ConfirmDialog } from '../components/Modal'
import { ProgressBar } from '../components/Progress'
import { pluralRu } from '../lib/dates'

type Filter = 'active' | 'archived' | 'all'

export default function Habits() {
  const { data, isDone, removeHabit, toggleArchive } = useApp()
  const [filter, setFilter] = useState<Filter>('active')
  const [categoryId, setCategoryId] = useState<string>('all')
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const list = useMemo(() => {
    return data.habits
      .filter((h) => (filter === 'all' ? true : filter === 'archived' ? h.archived : !h.archived))
      .filter((h) => (categoryId === 'all' ? true : h.categoryId === categoryId))
      .sort((a, b) => (a.archived === b.archived ? a.name.localeCompare(b.name, 'ru') : a.archived ? 1 : -1))
  }, [data.habits, filter, categoryId])

  const stats = useMemo(() => {
    const active = data.habits.filter((h) => !h.archived)
    return {
      active: active.length,
      archived: data.habits.length - active.length,
      avg: (() => {
        if (!active.length) return 0
        const sum = active.reduce((acc, h) => acc + last30(h, isDone).percent, 0)
        return Math.round(sum / active.length)
      })(),
    }
  }, [data.habits, isDone])

  const confirming = data.habits.find((h) => h.id === confirmId) ?? null

  return (
    <>
      <div className="page-head">
        <div className="stack" style={{ gap: 4 }}>
          <h1 className="t-h1">Привычки</h1>
          <p className="t-sm muted">
            Активных: {stats.active} · Архив: {stats.archived} · Среднее выполнение за 30 дней:{' '}
            {stats.avg}%
          </p>
        </div>
        <Link to="/app/habits/new" className="btn btn-primary">
          <Icon name="plus" /> Новая привычка
        </Link>
      </div>

      <div className="stack" style={{ gap: 'var(--sp-4)' }}>
        <div className="row-between wrap-row" style={{ gap: 'var(--sp-3)' }}>
          <div className="segmented" style={{ maxWidth: 340 }}>
            {(
              [
                ['active', `Активные · ${stats.active}`],
                ['archived', `Архив · ${stats.archived}`],
                ['all', 'Все'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                aria-pressed={filter === key}
                onClick={() => setFilter(key)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>

          <select
            className="select"
            style={{ width: 'auto', minWidth: 180 }}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            aria-label="Фильтр по категории"
          >
            <option value="all">Все категории</option>
            {data.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>

        {list.length === 0 ? (
          <div className="card">
            <EmptyState
              icon="📋"
              title={filter === 'archived' ? 'Архив пуст' : 'Привычек пока нет'}
              text={
                filter === 'archived'
                  ? 'Архивируйте ненужные привычки — они не будут мешать, но история сохранится.'
                  : 'Создайте первую привычку: назовите её, выберите иконку и цвет, задайте периодичность.'
              }
              action={
                filter !== 'archived' ? (
                  <Link to="/app/habits/new" className="btn btn-primary">
                    <Icon name="plus" /> Добавить привычку
                  </Link>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="grid grid-2">
            {list.map((habit) => {
              const streak = getStreak(habit, isDone)
              const stat30 = last30(habit, isDone)
              const skips = skipInfo(data, habit)
              const category = data.categories.find((c) => c.id === habit.categoryId)
              const usedSkips = skips.used

              return (
                <article
                  key={habit.id}
                  className="card hover-lift"
                  style={habit.archived ? { opacity: 0.72 } : undefined}
                >
                  <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
                    <IconBadge icon={habit.icon} color={habit.color} size={44} />
                    <div className="grow stack" style={{ gap: 4, minWidth: 0 }}>
                      <div className="row-between" style={{ gap: 8 }}>
                        <strong className="truncate">{habit.name}</strong>
                        {habit.archived && <span className="chip">Архив</span>}
                      </div>
                      <span className="t-xs muted truncate">
                        {frequencyLabel(habit)}
                        {habit.reminder ? ` · ⏰ ${habit.reminder}` : ''}
                        {category ? ` · ${category.icon} ${category.name}` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Стрик */}
                  <div
                    className="row-between"
                    style={{
                      marginTop: 'var(--sp-4)',
                      padding: 'var(--sp-3) var(--sp-4)',
                      borderRadius: 'var(--r-md)',
                      background: 'var(--surface-2)',
                      gap: 'var(--sp-3)',
                    }}
                  >
                    <div className="row" style={{ gap: 10 }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          width: 38,
                          height: 38,
                          borderRadius: 12,
                          background: streak.current > 0 ? 'var(--accent-soft)' : 'var(--surface-3)',
                          color: streak.current > 0 ? 'var(--accent)' : 'var(--muted)',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Flame size={20} active={streak.current > 0} />
                      </span>
                      <div className="stack" style={{ gap: 0 }}>
                        <span className="num" style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.1 }}>
                          {streak.current}
                          <span style={{ fontSize: 13, fontWeight: 600 }} className="muted">
                            {' '}
                            {pluralRu(streak.current, 'день', 'дня', 'дней')}
                          </span>
                        </span>
                        <span className="t-xs muted">подряд · рекорд {streak.best}</span>
                      </div>
                    </div>
                    <div className="stack" style={{ gap: 4, alignItems: 'flex-end', flex: 'none' }}>
                      <span className="t-xs muted">{weekCompletionText(habit, isDone)}</span>
                      <span className="chip chip-accent">
                        <Bolt /> 30 дней: {stat30.percent}%
                      </span>
                    </div>
                  </div>

                  <div className="stack" style={{ gap: 6, marginTop: 'var(--sp-4)' }}>
                    <ProgressBar percent={stat30.percent} size="sm" label="Выполнение за 30 дней" />
                    <div className="row-between t-xs muted">
                      <span>
                        За 30 дней: {stat30.done} из {stat30.planned}
                      </span>
                      <span className={skips.left === 0 ? 'accent-text' : undefined}>
                        {skips.left === 0
                          ? `Пропуски исчерпаны (${usedSkips}/${skips.allowance})`
                          : `Осталось ${skips.left} ${pluralRu(skips.left, 'пропуск', 'пропуска', 'пропусков')} в ${skips.monthLabel}`}
                      </span>
                    </div>
                  </div>

                  <div className="row" style={{ gap: 8, marginTop: 'var(--sp-4)', flexWrap: 'wrap' }}>
                    <Link to={`/app/stats/${habit.id}`} className="btn btn-ghost btn-sm">
                      <Icon name="stats" size={15} /> Статистика
                    </Link>
                    <Link to={`/app/habits/${habit.id}/edit`} className="btn btn-subtle btn-sm">
                      <Icon name="edit" size={15} /> Изменить
                    </Link>
                    <div className="grow" />
                    <button
                      className="btn btn-subtle btn-sm"
                      onClick={() => toggleArchive(habit.id)}
                      title={habit.archived ? 'Вернуть в активные' : 'В архив'}
                    >
                      <Icon name="archive" size={15} />
                      {habit.archived ? 'Вернуть' : 'В архив'}
                    </button>
                    <button
                      className="btn btn-subtle btn-sm"
                      style={{ color: 'var(--danger)' }}
                      onClick={() => setConfirmId(habit.id)}
                      title="Удалить"
                    >
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(confirming)}
        title="Удалить привычку?"
        text={`«${confirming?.name ?? ''}» и вся её история будут удалены безвозвратно. Если хотите сохранить статистику — используйте архив.`}
        onCancel={() => setConfirmId(null)}
        onConfirm={() => {
          if (confirmId) removeHabit(confirmId)
          setConfirmId(null)
        }}
      />
    </>
  )
}

function Bolt() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="currentColor" />
    </svg>
  )
}
