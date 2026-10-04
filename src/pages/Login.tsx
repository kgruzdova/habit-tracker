import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from './AuthLayout'
import { TextField } from '../components/TextField'
import { Icon } from '../components/Icons'

export default function Login() {
  const navigate = useNavigate()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!login.trim()) {
      setError('Введите логин.')
      return
    }
    if (password.length < 4) {
      setError('Пароль должен содержать минимум 4 символа.')
      return
    }
    setError(null)
    navigate('/app/today')
  }

  return (
    <AuthLayout
      title="Вход"
      subtitle="Личный трекер: форма показана как макет, данные не отправляются на сервер."
      footer={
        <div className="row-between t-sm">
          <span className="muted">Нет аккаунта?</span>
          <Link to="/register" className="accent-text" style={{ fontWeight: 700 }}>
            Регистрация
          </Link>
        </div>
      }
    >
      <form onSubmit={submit} className="stack" style={{ gap: 'var(--sp-4)' }} noValidate>
        <TextField
          id="login"
          label="Логин"
          icon="user"
          placeholder="username"
          autoComplete="username"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
        />

        <TextField
          id="password"
          label="Пароль"
          icon="lock"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error}
        />

        <div className="row-between">
          <label className="row t-sm muted" style={{ gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" aria-label="Запомнить меня" style={{ accentColor: 'var(--accent)' }} />
            Запомнить меня
          </label>
          <Link to="/recover" className="t-sm accent-text" style={{ fontWeight: 600 }}>
            Забыли пароль?
          </Link>
        </div>

        <button type="submit" className="btn btn-primary btn-block btn-lg">
          Войти
          <Icon name="chevronRight" size={16} />
        </button>

        <Link to="/app/today" className="btn btn-ghost btn-block">
          Открыть трекер без входа
        </Link>
      </form>
    </AuthLayout>
  )
}
