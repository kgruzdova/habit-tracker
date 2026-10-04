import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../store/context'
import { downloadJson } from '../lib/storage'
import { ConfirmDialog } from '../components/Modal'
import { Icon } from '../components/Icons'
import { pluralRu } from '../lib/dates'

export default function SettingsPage() {
  const { data, updateSettings, exportAll, eraseAll, loadDemo } = useApp()
  const [confirmErase, setConfirmErase] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  const flash = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 2600)
  }

  const doExport = () => {
    const stamp = new Date().toISOString().slice(0, 10)
    downloadJson(`habit-tracker-${stamp}.json`, exportAll())
    flash('Файл с данными сохранён')
  }

  return (
    <>
      <div className="page-head">
        <div className="stack" style={{ gap: 4 }}>
          <h1 className="t-h1">Профиль и настройки</h1>
          <p className="t-sm muted">Профиль, оформление, уведомления и работа с данными.</p>
        </div>
      </div>

      <div className="stack" style={{ gap: 'var(--sp-5)' }}>
        {toast && (
          <div className="card row" style={{ gap: 10, background: 'var(--ok-soft)', borderColor: 'transparent' }}>
            <Icon name="check" />
            <span className="t-sm">{toast}</span>
          </div>
        )}

        <section className="card">
          <div className="card-head">
            <h2 className="card-title">Профиль</h2>
          </div>
          <div className="stack" style={{ gap: 'var(--sp-4)', maxWidth: 420 }}>
            <div className="field">
              <label className="label" htmlFor="profile-name">
                Имя
              </label>
              <input
                id="profile-name"
                ref={nameRef}
                className="input"
                value={data.settings.name}
                onChange={(e) => updateSettings({ name: e.target.value })}
                placeholder="Как к вам обращаться"
              />
              <span className="hint">Используется в приветствии на странице «Сегодня».</span>
            </div>
            <div className="row-between t-sm" style={{ padding: '12px 0', borderTop: '1px solid var(--border)' }}>
              <span className="muted">Привычек всего</span>
              <strong className="num">{data.habits.length}</strong>
            </div>
            <div className="row-between t-sm" style={{ padding: '12px 0', borderTop: '1px solid var(--border)' }}>
              <span className="muted">Отметок выполнения</span>
              <strong className="num">{Object.keys(data.completions).length}</strong>
            </div>
            <div className="row-between t-sm" style={{ padding: '12px 0', borderTop: '1px solid var(--border)' }}>
              <span className="muted">Категорий</span>
              <strong className="num">{data.categories.length}</strong>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <h2 className="card-title">Оформление</h2>
          </div>
          <div className="stack" style={{ gap: 'var(--sp-4)', maxWidth: 420 }}>
            <div className="field">
              <span className="label">Тема</span>
              <div className="segmented">
                <button
                  aria-pressed={data.settings.theme === 'light'}
                  onClick={() => updateSettings({ theme: 'light' })}
                >
                  Светлая
                </button>
                <button
                  aria-pressed={data.settings.theme === 'dark'}
                  onClick={() => updateSettings({ theme: 'dark' })}
                >
                  Тёмная
                </button>
              </div>
              <span className="hint">Тема сохраняется в браузере и применяется сразу.</span>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <h2 className="card-title">Уведомления</h2>
          </div>
          <div className="stack" style={{ gap: 'var(--sp-4)', maxWidth: 480 }}>
            <Toggle
              label="Push-уведомления"
              hint="Напоминания о времени привычки. В текущей версии — переключатель."
              checked={data.settings.notifyPush}
              onChange={(v) => updateSettings({ notifyPush: v })}
            />
            <hr className="divider" />
            <Toggle
              label="Email-уведомления"
              hint="Сводка недели на почту. В текущей версии — переключатель."
              checked={data.settings.notifyEmail}
              onChange={(v) => updateSettings({ notifyEmail: v })}
            />
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <h2 className="card-title">Данные</h2>
          </div>
          <div className="stack" style={{ gap: 'var(--sp-4)', maxWidth: 560 }}>
            <p className="t-sm muted">
              Все данные хранятся только в этом браузере (localStorage). Никакого сервера и
              синхронизации — это личный инструмент. Регулярно делайте экспорт, чтобы не потерять
              историю.
            </p>
            <div className="wrap-row">
              <button className="btn btn-primary" onClick={doExport}>
                <Icon name="download" /> Экспорт данных (JSON)
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  loadDemo()
                  flash('Загружены демонстрационные данные')
                }}
              >
                Загрузить демо-данные
              </button>
              <button className="btn btn-danger" onClick={() => setConfirmErase(true)}>
                <Icon name="trash" size={16} /> Удалить все данные
              </button>
            </div>
            <p className="t-xs muted">
              В архиве:{' '}
              {data.habits.filter((h) => h.archived).length}{' '}
              {pluralRu(
                data.habits.filter((h) => h.archived).length,
                'привычка',
                'привычки',
                'привычек',
              )}
              . Архивные привычки можно восстановить в разделе «Привычки».
            </p>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <h2 className="card-title">Учётная запись</h2>
          </div>
          <div className="stack" style={{ gap: 'var(--sp-4)', maxWidth: 520 }}>
            <p className="t-sm muted">
              Это личный трекер: регистрация закрыта, данные не уходят на сервер. Экраны входа и
              регистрации существуют как макеты — они ни к чему не подключены.
            </p>
            <div className="wrap-row">
              <Link to="/login" className="btn btn-ghost">
                <Icon name="logout" size={16} /> Вход
              </Link>
              <Link to="/register" className="btn btn-ghost">
                Регистрация
              </Link>
              <Link to="/" className="btn btn-subtle">
                На главную
              </Link>
            </div>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={confirmErase}
        title="Удалить все данные?"
        text="Все привычки, категории, отметки и настройки будут удалены безвозвратно. Сделайте экспорт, если хотите сохранить копию."
        confirmLabel="Удалить всё"
        onCancel={() => setConfirmErase(false)}
        onConfirm={() => {
          eraseAll()
          setConfirmErase(false)
          flash('Данные удалены')
        }}
      />
    </>
  )
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="row-between" style={{ gap: 'var(--sp-4)' }}>
      <div className="stack" style={{ gap: 2, minWidth: 0 }}>
        <span style={{ fontWeight: 600 }}>{label}</span>
        <span className="t-xs muted">{hint}</span>
      </div>
      <label className="switch" style={{ flex: 'none' }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-label={label}
        />
        <span className="switch-track" />
      </label>
    </div>
  )
}
