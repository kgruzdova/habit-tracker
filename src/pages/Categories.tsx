import { useMemo, useState } from 'react'
import { useApp } from '../store/context'
import { CATEGORY_ICONS, HABIT_COLORS } from '../lib/storage'
import { Icon, IconBadge } from '../components/Icons'
import { ConfirmDialog, EmptyState, Modal } from '../components/Modal'
import { pluralRu } from '../lib/dates'

interface Draft {
  id: string | null
  name: string
  icon: string
  color: string
}

const emptyDraft = (): Draft => ({ id: null, name: '', icon: '🎯', color: HABIT_COLORS[0] })

export default function Categories() {
  const { data, addCategory, updateCategory, removeCategory } = useApp()
  const [draft, setDraft] = useState<Draft | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const counts = useMemo(() => {
    const map = new Map<string, { total: number; active: number }>()
    for (const habit of data.habits) {
      if (!habit.categoryId) continue
      const entry = map.get(habit.categoryId) ?? { total: 0, active: 0 }
      entry.total += 1
      if (!habit.archived) entry.active += 1
      map.set(habit.categoryId, entry)
    }
    return map
  }, [data.habits])

  const ungrouped = data.habits.filter((h) => !h.categoryId).length

  const save = () => {
    if (!draft || draft.name.trim().length < 2) return
    if (draft.id) {
      updateCategory(draft.id, { name: draft.name.trim(), icon: draft.icon, color: draft.color })
    } else {
      addCategory({ name: draft.name.trim(), icon: draft.icon, color: draft.color })
    }
    setDraft(null)
  }

  const confirming = data.categories.find((c) => c.id === confirmId) ?? null

  return (
    <>
      <div className="page-head">
        <div className="stack" style={{ gap: 4 }}>
          <h1 className="t-h1">Категории</h1>
          <p className="t-sm muted">
            {data.categories.length} {pluralRu(data.categories.length, 'категория', 'категории', 'категорий')}
            {ungrouped > 0 && ` · ${ungrouped} привычек без категории`}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setDraft(emptyDraft())}>
          <Icon name="plus" /> Новая категория
        </button>
      </div>

      {data.categories.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="🗂"
            title="Категорий нет"
            text="Создайте свои категории, чтобы привычки было легче группировать."
          />
        </div>
      ) : (
        <div className="grid grid-3">
          {data.categories.map((category) => {
            const count = counts.get(category.id) ?? { total: 0, active: 0 }
            return (
              <article key={category.id} className="card hover-lift" style={{ padding: 'var(--sp-4)' }}>
                <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
                  <IconBadge icon={category.icon} color={category.color} size={44} />
                  <div className="grow stack" style={{ gap: 8, minWidth: 0 }}>
                    <strong style={{ lineHeight: 1.3, wordBreak: 'break-word' }}>
                      {category.name}
                    </strong>
                    <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                      <span className="chip">
                        {count.total === 0
                          ? 'Пока без привычек'
                          : `${count.active} активных из ${count.total}`}
                      </span>
                      {category.system && <span className="chip">По умолчанию</span>}
                    </div>
                  </div>
                </div>

                <div className="row" style={{ gap: 8, marginTop: 'var(--sp-4)' }}>
                  <button
                    className="btn btn-subtle btn-sm"
                    onClick={() =>
                      setDraft({
                        id: category.id,
                        name: category.name,
                        icon: category.icon,
                        color: category.color,
                      })
                    }
                  >
                    <Icon name="edit" size={15} />
                  </button>
                  <button
                    className="btn btn-subtle btn-sm"
                    style={{ color: 'var(--danger)' }}
                    onClick={() => setConfirmId(category.id)}
                    aria-label={`Удалить категорию ${category.name}`}
                  >
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <Modal
        open={Boolean(draft)}
        title={draft?.id ? 'Редактирование категории' : 'Новая категория'}
        onClose={() => setDraft(null)}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setDraft(null)}>
              Отмена
            </button>
            <button
              className="btn btn-primary"
              onClick={save}
              disabled={!draft || draft.name.trim().length < 2}
            >
              Сохранить
            </button>
          </>
        }
      >
        {draft && (
          <div className="stack" style={{ gap: 'var(--sp-4)' }}>
            <div className="field">
              <label className="label" htmlFor="cat-name">
                Название
              </label>
              <input
                id="cat-name"
                className="input"
                placeholder="Например: Гигиена"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                autoFocus
              />
              {draft.name.trim().length > 0 && draft.name.trim().length < 2 && (
                <span className="hint" style={{ color: 'var(--danger)' }}>
                  Минимум 2 символа.
                </span>
              )}
            </div>

            <div className="field">
              <span className="label">Иконка</span>
              <div className="wrap-row" style={{ gap: 6 }}>
                {CATEGORY_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    aria-label={`Иконка ${icon}`}
                    aria-pressed={draft.icon === icon}
                    onClick={() => setDraft({ ...draft, icon })}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      fontSize: 19,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: draft.icon === icon ? 'var(--accent-soft)' : 'var(--surface-2)',
                      border: `1px solid ${draft.icon === icon ? 'var(--accent)' : 'var(--border)'}`,
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
                    aria-label={`Цвет ${color}`}
                    aria-pressed={draft.color === color}
                    onClick={() => setDraft({ ...draft, color })}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 11,
                      background: color,
                      border: '2px solid transparent',
                      outline: draft.color === color ? '2px solid var(--text)' : 'none',
                      outlineOffset: 2,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(confirming)}
        title="Удалить категорию?"
        text={`Категория «${confirming?.name ?? ''}» будет удалена. Привычки останутся, но потеряют категорию.`}
        onCancel={() => setConfirmId(null)}
        onConfirm={() => {
          if (confirmId) removeCategory(confirmId)
          setConfirmId(null)
        }}
      />
    </>
  )
}
