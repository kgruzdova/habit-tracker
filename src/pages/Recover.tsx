import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthLayout } from './AuthLayout'
import { TextField } from '../components/TextField'
import { Icon } from '../components/Icons'

export default function Recover() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Введите корректный email.')
      return
    }
    setError(null)
    setSent(true)
  }

  return (
    <AuthLayout
      title="Восстановление пароля"
      subtitle="Укажите email — на него придёт ссылка для сброса пароля."
      footer={
        <div className="row-between t-sm">
          <span className="muted">Вспомнили пароль?</span>
          <Link to="/login" className="accent-text" style={{ fontWeight: 700 }}>
            Вернуться ко входу
          </Link>
        </div>
      }
    >
      {sent ? (
        <div className="stack" style={{ gap: 'var(--sp-4)' }}>
          <div
            className="row"
            style={{
              gap: 12,
              padding: 'var(--sp-4)',
              borderRadius: 'var(--r-md)',
              background: 'var(--ok-soft)',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 34,
                height: 34,
                flex: 'none',
                borderRadius: '50%',
                background: 'var(--ok)',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Icon name="check" size={17} />
            </span>
            <div className="stack" style={{ gap: 2, minWidth: 0 }}>
              <strong className="t-sm">Письмо отправлено</strong>
              <span className="t-xs muted" style={{ wordBreak: 'break-all' }}>
                Проверьте {email} и следуйте инструкции в письме.
              </span>
            </div>
          </div>

          <ol className="stack" style={{ gap: 8, paddingLeft: 18, listStyle: 'decimal' }}>
            <li className="t-sm muted">Откройте письмо и найдите кнопку «Сбросить пароль».</li>
            <li className="t-sm muted">Задайте новый пароль — минимум 6 символов.</li>
            <li className="t-sm muted">Вернитесь на страницу входа и войдите с новым паролем.</li>
          </ol>

          <button className="btn btn-ghost btn-block" onClick={() => setSent(false)}>
            Отправить на другой адрес
          </button>
          <Link to="/app/today" className="btn btn-subtle btn-block">
            Открыть трекер без сброса
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="stack" style={{ gap: 'var(--sp-4)' }} noValidate>
          <TextField
            id="recover-email"
            label="Email"
            icon="mail"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            hint="Ссылка для сброса действует 1 час."
          />

          <button type="submit" className="btn btn-primary btn-block btn-lg">
            Отправить инструкцию
            <Icon name="chevronRight" size={16} />
          </button>
        </form>
      )}
    </AuthLayout>
  )
}
