import { Link } from 'react-router-dom'
import { Icon } from '../components/Icons'

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--sp-5)',
      }}
    >
      <div className="stack" style={{ gap: 'var(--sp-5)', alignItems: 'center', maxWidth: 460 }}>
        <span className="num accent-text" style={{ fontSize: 76, fontWeight: 800, lineHeight: 1 }}>
          404
        </span>
        <div className="stack" style={{ gap: 8, alignItems: 'center' }}>
          <h1 className="t-h2">Страница не найдена</h1>
          <p className="t-body" style={{ textAlign: 'center' }}>
            Похоже, такого маршрута не существует. Возможно, ссылка устарела или в адресе опечатка.
          </p>
        </div>
        <div className="wrap-row" style={{ justifyContent: 'center' }}>
          <Link to="/app/today" className="btn btn-primary">
            <Icon name="today" size={16} /> На страницу «Сегодня»
          </Link>
          <Link to="/" className="btn btn-ghost">
            На главную
          </Link>
        </div>
      </div>
    </div>
  )
}
