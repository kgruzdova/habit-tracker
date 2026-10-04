import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from './AuthLayout'
import { TextField } from '../components/TextField'
import { Icon } from '../components/Icons'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    login: '',
    email: '',
    password: '',
    confirm: '',
  })
  const [error, setError] = useState<string | null>(null)

  const errors = useMemo(() => {
    const out: Record<string, string> = {}
    if (form.login.trim().length < 3) out.login = 'Минимум 3 символа.'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) out.email = 'Введите корректный email.'
    if (form.password.length < 6) out.password = 'Минимум 6 символов.'
    if (form.confirm !== form.password) out.confirm = 'Пароли не совпадают.'
    return out
  }, [form])

  const valid = Object.keys(errors).length === 0

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) {
      setError('Проверьте поля формы.')
      return
    }
    setError(null)
    navigate('/app/today')
  }

  return (
    <AuthLayout
      title="Регистрация"
      subtitle="Создайте себе логин и пароль — так выглядит форма. В трекере данные хранятся локально."
      footer={
        <div className="row-between t-sm">
          <span className="muted">Уже есть аккаунт?</span>
          <Link to="/login" className="accent-text" style={{ fontWeight: 700 }}>
            Войти
          </Link>
        </div>
      }
    >
      <form onSubmit={submit} className="stack" style={{ gap: 'var(--sp-4)' }} noValidate>
        <TextField
          id="reg-login"
          label="Логин"
          icon="user"
          placeholder="username"
          autoComplete="username"
          value={form.login}
          onChange={(e) => set('login', e.target.value)}
          error={form.login ? errors.login : null}
        />

        <TextField
          id="reg-email"
          label="Email"
          icon="mail"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          error={form.email ? errors.email : null}
        />

        <TextField
          id="reg-password"
          label="Пароль"
          icon="lock"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => set('password', e.target.value)}
          error={form.password ? errors.password : null}
        />

        <TextField
          id="reg-confirm"
          label="Подтверждение пароля"
          icon="lock"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          value={form.confirm}
          onChange={(e) => set('confirm', e.target.value)}
          error={form.confirm ? errors.confirm : null}
        />

        {error && (
          <p className="t-sm" style={{ color: 'var(--danger)' }}>
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={!valid}>
          Зарегистрироваться
          <Icon name="chevronRight" size={16} />
        </button>

        <Link to="/app/today" className="btn btn-ghost btn-block">
          Пропустить и открыть трекер
        </Link>
      </form>
    </AuthLayout>
  )
}
