import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Icon } from './Icons'
import { useApp } from '../store/context'

const NAV = [
  { to: '/app/today', label: 'Сегодня', icon: 'today' },
  { to: '/app/habits', label: 'Привычки', icon: 'list' },
  { to: '/app/categories', label: 'Категории', icon: 'categories' },
  { to: '/app/calendar', label: 'Календарь', icon: 'calendar' },
  { to: '/app/stats', label: 'Статистика', icon: 'stats' },
  { to: '/app/settings', label: 'Настройки', icon: 'settings' },
]

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="stack" style={{ gap: 2 }}>
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `nav-item${isActive ? ' nav-item-active' : ''}`
          }
        >
          <Icon name={item.icon} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="row" style={{ gap: 10 }}>
      <span
        aria-hidden="true"
        style={{
          width: 34,
          height: 34,
          flex: 'none',
          borderRadius: 11,
          background: 'var(--accent)',
          color: 'var(--accent-contrast)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 17,
        }}
      >
        🎯
      </span>
      {!compact && (
        <span style={{ fontWeight: 800, letterSpacing: '-0.02em', fontSize: 16 }}>Дисциплина</span>
      )}
    </div>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { data, updateSettings } = useApp()
  const location = useLocation()

  // Закрываем меню при смене маршрута (включая кнопку «назад» в браузере).
  // Состояние корректируется во время рендера, а не в эффекте.
  const [lastPath, setLastPath] = useState(location.pathname)
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname)
    if (menuOpen) setMenuOpen(false)
  }

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const isDark = data.settings.theme === 'dark'

  return (
    <div className="shell">
      <style>{`
        .shell { display: flex; min-height: 100vh; }
        .nav-item {
          display: flex; align-items: center; gap: 11px;
          padding: 10px 13px; border-radius: var(--r-sm);
          font-size: 14.5px; font-weight: 600; color: var(--text-2);
          transition: background var(--dur) var(--ease), color var(--dur) var(--ease);
        }
        .nav-item:hover { background: var(--surface-2); color: var(--text); }
        .nav-item-active { background: var(--accent-soft); color: var(--accent); }
        .sidebar {
          width: var(--sidebar-w); flex: none;
          border-right: 1px solid var(--border);
          background: var(--surface);
          padding: var(--sp-5);
          position: sticky; top: 0; height: 100vh;
          display: flex; flex-direction: column; gap: var(--sp-6);
        }
        .main { flex: 1 1 auto; min-width: 0; }
        .topbar {
          display: flex; align-items: center; gap: var(--sp-3);
          padding: var(--sp-3) var(--sp-4);
          border-bottom: 1px solid var(--border);
          background: color-mix(in srgb, var(--bg) 88%, transparent);
          backdrop-filter: blur(10px);
          position: sticky; top: 0; z-index: 20;
        }
        .page { padding: var(--sp-6) var(--sp-5) var(--sp-8); }
        .page-head { display: flex; align-items: flex-end; justify-content: space-between; gap: var(--sp-4); flex-wrap: wrap; margin-bottom: var(--sp-5); }
        .scrim { position: fixed; inset: 0; background: rgba(24,18,14,.45); z-index: 40; animation: fade 160ms var(--ease); }
        @keyframes fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideIn { from { transform: translateX(-100%) } to { transform: translateX(0) } }
        .drawer { animation: slideIn 200ms var(--ease); }
        @media (max-width: 1000px) {
          .sidebar { display: none; }
          .page { padding: var(--sp-5) var(--sp-4) var(--sp-7); }
        }
      `}</style>

      <aside className="sidebar">
        <Brand />
        <NavItems />
        <div className="grow" />
        <div className="stack" style={{ gap: 10 }}>
          <button
            className="nav-item"
            onClick={() => updateSettings({ theme: isDark ? 'light' : 'dark' })}
            aria-label="Переключить тему"
          >
            <Icon name={isDark ? 'sun' : 'moon'} />
            <span>{isDark ? 'Светлая тема' : 'Тёмная тема'}</span>
          </button>
          <NavLink to="/" className="nav-item">
            <Icon name="logout" />
            <span>На главную</span>
          </NavLink>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setMenuOpen(true)}
            aria-label="Открыть меню"
          >
            <Icon name="burger" size={20} />
          </button>
          <Brand compact />
          <div className="grow" />
          <button
            className="btn btn-subtle btn-icon"
            onClick={() => updateSettings({ theme: isDark ? 'light' : 'dark' })}
            aria-label="Переключить тему"
          >
            <Icon name={isDark ? 'sun' : 'moon'} />
          </button>
        </header>
        <main className="page">{children}</main>
      </div>

      {menuOpen && (
        <>
          <div className="scrim" onClick={() => setMenuOpen(false)} />
          <div
            className="drawer"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              zIndex: 50,
              width: 'min(300px, 86vw)',
              background: 'var(--surface)',
              borderRight: '1px solid var(--border)',
              padding: 'var(--sp-5)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--sp-6)',
            }}
          >
            <div className="row-between">
              <Brand />
              <button
                className="btn btn-subtle btn-icon"
                onClick={() => setMenuOpen(false)}
                aria-label="Закрыть меню"
              >
                <Icon name="close" />
              </button>
            </div>
            <NavItems onNavigate={() => setMenuOpen(false)} />
            <div className="grow" />
            <div className="stack" style={{ gap: 10 }}>
              <button
                className="nav-item"
                onClick={() => {
                  updateSettings({ theme: isDark ? 'light' : 'dark' })
                  setMenuOpen(false)
                }}
              >
                <Icon name={isDark ? 'sun' : 'moon'} />
                <span>{isDark ? 'Светлая тема' : 'Тёмная тема'}</span>
              </button>
              <NavLink to="/" className="nav-item" onClick={() => setMenuOpen(false)}>
                <Icon name="logout" />
                <span>На главную</span>
              </NavLink>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
