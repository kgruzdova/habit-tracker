import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icons'

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="auth">
      <style>{`
        .auth {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--sp-5);
        }
        .auth-card { width: 100%; max-width: 420px; }
      `}</style>
      <div className="auth-card stack" style={{ gap: 'var(--sp-5)' }}>
        <Link to="/" className="row" style={{ gap: 10, justifyContent: 'center' }}>
          <span
            aria-hidden="true"
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: 'var(--accent)',
              color: 'var(--accent-contrast)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}
          >
            🎯
          </span>
          <strong style={{ letterSpacing: '-0.02em', fontSize: 17 }}>Дисциплина</strong>
        </Link>

        <div className="card">
          <div className="stack" style={{ gap: 6, marginBottom: 'var(--sp-5)' }}>
            <h1 className="t-h2">{title}</h1>
            <p className="t-sm muted">{subtitle}</p>
          </div>
          {children}
        </div>

        <div className="stack" style={{ gap: 'var(--sp-3)' }}>
          {footer}
          <p className="t-xs muted row" style={{ gap: 6, justifyContent: 'center' }}>
            <Icon name="lock" size={13} />
            Личный трекер: данные остаются в вашем браузере и никуда не отправляются.
          </p>
        </div>
      </div>
    </div>
  )
}
