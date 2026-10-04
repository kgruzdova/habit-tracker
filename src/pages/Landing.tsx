import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../store/context'
import { Icon } from '../components/Icons'
import { ProgressBar } from '../components/Progress'
import { todayKey } from '../lib/dates'

const STEPS = [
  {
    icon: '🎯',
    title: 'Опишите привычку',
    text: 'Название, иконка, цвет, периодичность и лимит пропусков. Пять полей — и привычка в списке.',
  },
  {
    icon: '☑️',
    title: 'Отмечайте каждый день',
    text: 'Один чекбокс на странице «Сегодня». Забыли вчера — можно исправить в календаре.',
  },
  {
    icon: '🔥',
    title: 'Следите за серией',
    text: 'Трекер считает стрики, рекорды и честно показывает, сколько пропусков ещё осталось.',
  },
  {
    icon: '📈',
    title: 'Читайте результат',
    text: 'Не «80% выполнения», а «2 книги и 40 литров воды за месяц» — понятная польза.',
  },
]

const FEATURES = [
  { icon: '📅', title: 'Прогресс X из Y', text: 'Кольцевой индикатор и недельная полоса на главной странице.' },
  { icon: '🔥', title: 'Стрики и рекорды', text: 'Текущая и лучшая серия, «30 дней подряд!» с горящей иконкой.' },
  { icon: '🎫', title: 'Счётчик пропусков', text: 'Можно иногда расслабиться: лимит на месяц и честный остаток.' },
  { icon: '🗓', title: 'Тепловая карта', text: 'История по дням в календаре, любую отметку можно исправить.' },
  { icon: '📊', title: 'Статистика по графикам', text: 'Проценты за 7/15/30 дней, динамика по дням и неделям.' },
  { icon: '🧩', title: 'Категории', text: 'Девять готовых категорий: здоровье, спорт, сон, работа и другие.' },
  { icon: '🌗', title: 'Светлая и тёмная тема', text: 'Переключается в настройках, цвета подобраны для обеих расцветок.' },
  { icon: '🔒', title: 'Только для себя', text: 'Данные лежат в браузере, регистрация закрыта, ничего никуда не отправляется.' },
]

const ADVANTAGES = [
  {
    title: 'Дисциплина без чувства вины',
    text: 'Лимит пропусков снимает страх «сорвать идеальную серию» и возвращает к привычке через день.',
  },
  {
    title: 'Мягкие напоминания',
    text: 'Блок «Лучше, чем вчера» подсказывает, что вы уже сделали, без давления и нотаций.',
  },
  {
    title: 'Результат в понятных единицах',
    text: 'Страницы превращаются в книги, минуты — в сэкономленные часы, стаканы — в литры.',
  },
  {
    title: 'Работает на телефоне и десктопе',
    text: 'Один интерфейс: боковое меню на 360 px и на широком экране, без горизонтальной прокрутки.',
  },
]

export default function Landing() {
  const { data, isDone } = useApp()
  const todayHabits = useMemo(() => data.habits.filter((h) => !h.archived), [data.habits])
  const previewDone = useMemo(
    () => todayHabits.filter((h) => isDone(h.id, todayKey())).length,
    [todayHabits, isDone],
  )
  const previewTotal = todayHabits.length || 5
  const previewPercent = Math.round((previewDone / previewTotal) * 100)

  return (
    <div className="landing">
      <style>{`
        .landing { min-height: 100vh; }
        .lp-section { padding: var(--sp-8) 0; }
        .lp-grid-2 { display: grid; gap: var(--sp-6); grid-template-columns: minmax(0, 1fr); }
        .lp-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--r-lg); padding: var(--sp-5);
        }
        .lp-feature { display: flex; gap: 14px; }
        .lp-feature-icon {
          width: 40px; height: 40px; flex: none; border-radius: 12px;
          display: inline-flex; align-items: center; justify-content: center;
          background: var(--accent-soft); font-size: 20px;
        }
        .lp-phone {
          width: min(300px, 100%); margin-inline: auto;
          border: 8px solid var(--border-strong); border-radius: 34px;
          background: var(--bg); overflow: hidden; box-shadow: var(--shadow-lg);
        }
        .lp-shot {
          border: 1px solid var(--border); border-radius: var(--r-lg);
          background: var(--surface); overflow: hidden; box-shadow: var(--shadow-md);
        }
        .lp-bar {
          display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 5px;
        }
        .lp-bar > div { height: 30px; border-radius: 7px; }
        .lp-heat { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; }
        .lp-heat > div { aspect-ratio: 1; border-radius: 6px; }
        .lp-cta {
          display: flex; gap: var(--sp-3); flex-wrap: wrap;
        }
        .lp-nav {
          position: sticky; top: 0; z-index: 30;
          background: color-mix(in srgb, var(--bg) 90%, transparent);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border);
        }
        .lp-nav-inner {
          display: flex; align-items: center; gap: var(--sp-3);
          padding: var(--sp-3) 0;
        }
        .lp-hero {
          padding: var(--sp-8) 0 var(--sp-7);
          display: grid; gap: var(--sp-7);
          grid-template-columns: minmax(0, 1fr);
          align-items: center;
        }
        .lp-check { display: flex; gap: 10px; align-items: flex-start; }
        .lp-foot {
          border-top: 1px solid var(--border); padding: var(--sp-6) 0;
          color: var(--muted); font-size: 13.5px;
        }
        .lp-note {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px; border-radius: var(--r-pill);
          background: var(--accent-soft); color: var(--accent);
          font-size: 13px; font-weight: 700;
        }
        @media (min-width: 900px) {
          .lp-hero { grid-template-columns: 1.05fr 0.95fr; }
          .lp-grid-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (min-width: 1280px) {
          .lp-section { padding: var(--sp-8) 0; }
        }
      `}</style>

      <header className="lp-nav">
        <div className="wrap lp-nav-inner">
          <span className="row" style={{ gap: 10 }}>
            <span
              aria-hidden="true"
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: 'var(--accent)',
                color: 'var(--accent-contrast)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              🎯
            </span>
            <strong style={{ letterSpacing: '-0.02em' }}>Дисциплина</strong>
          </span>
          <div className="grow" />
          <nav className="row hide-sm" style={{ gap: 'var(--sp-4)' }}>
            <a className="t-sm muted" href="#how">Как это работает</a>
            <a className="t-sm muted" href="#features">Возможности</a>
            <a className="t-sm muted" href="#dashboard">Дашборд</a>
          </nav>
          <Link to="/login" className="btn btn-ghost btn-sm">
            Вход
          </Link>
          <Link to="/app/today" className="btn btn-primary btn-sm">
            Открыть трекер
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="wrap lp-hero">
          <div className="stack" style={{ gap: 'var(--sp-5)' }}>
            <span className="lp-note">
              <Icon name="spark" size={14} /> Личный трекер привычек · только для себя
            </span>
            <h1 className="t-display">
              Дисциплина, которая <span className="accent-text">выстроена</span> в одну
              привычку
            </h1>
            <p className="t-body" style={{ fontSize: 17, maxWidth: 520 }}>
              Это мой персональный трекер: отмечаю выполнение, считаю серии и смотрю на
              статистику в понятных единицах. Никакой регистрации для других — приложение
              существует, чтобы выстроить дисциплину и укрепить свои привычки.
            </p>
            <div className="lp-cta">
              <Link to="/app/today" className="btn btn-primary btn-lg">
                Начать отмечать
                <Icon name="chevronRight" />
              </Link>
              <a href="#dashboard" className="btn btn-ghost btn-lg">
                Посмотреть дашборд
              </a>
            </div>
            <div className="stack" style={{ gap: 10, marginTop: 'var(--sp-2)' }}>
              {[
                'Данные хранятся только в вашем браузере',
                'Чекбокс вместо анкет — отметка занимает секунду',
                'Лимит пропусков, чтобы не бросить из-за одного дня',
              ].map((text) => (
                <div key={text} className="lp-check">
                  <span
                    aria-hidden="true"
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: 'var(--ok-soft)',
                      color: 'var(--ok)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flex: 'none',
                    }}
                  >
                    <Icon name="check" size={13} />
                  </span>
                  <span className="t-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Мокап дашборда */}
          <div className="lp-phone">
            <div style={{ padding: 'var(--sp-4)', display: 'grid', gap: 'var(--sp-3)' }}>
              <div className="row-between">
                <span className="t-xs muted">Сегодня</span>
                <span className="chip chip-accent t-xs">3 из 5</span>
              </div>
              <div
                className="row"
                style={{
                  gap: 'var(--sp-4)',
                  padding: 'var(--sp-4)',
                  borderRadius: 'var(--r-md)',
                  background: 'var(--surface)',
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    flex: 'none',
                    borderRadius: '50%',
                    background: 'conic-gradient(var(--accent) 0 60%, var(--surface-3) 60% 100%)',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'var(--surface)',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    {previewPercent}%
                  </div>
                </div>
                <div className="stack" style={{ gap: 4, minWidth: 0 }}>
                  <strong className="t-sm">День в процессе</strong>
                  <span className="t-xs muted">Осталось 2 отметки</span>
                </div>
              </div>
              <div
                style={{
                  padding: 'var(--sp-4)',
                  borderRadius: 'var(--r-md)',
                  background: 'var(--surface)',
                  display: 'grid',
                  gap: 10,
                }}
              >
                {[
                  ['💧', 'Вода', true, '#2f8aaa'],
                  ['📖', 'Чтение', true, '#6a4fd0'],
                  ['🏃', 'Пробежка', false, '#2f9e63'],
                ].map(([icon, name, done, color]) => (
                  <div key={String(name)} className="row" style={{ gap: 10 }}>
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 7,
                        background: done ? String(color) : 'transparent',
                        border: `2px solid ${done ? String(color) : 'var(--border-strong)'}`,
                        color: '#fff',
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      {done && <Icon name="check" size={12} />}
                    </span>
                    <span aria-hidden="true">{icon}</span>
                    <span className="t-sm grow truncate">{name}</span>
                    {done && <FlameDot />}
                  </div>
                ))}
              </div>
              <div
                style={{
                  padding: 'var(--sp-4)',
                  borderRadius: 'var(--r-md)',
                  background: 'var(--ok-soft)',
                  color: 'var(--text-2)',
                  fontSize: 12.5,
                  lineHeight: 1.4,
                }}
              >
                🔥 <strong style={{ color: 'var(--text)' }}>Чтение: 12 дней подряд.</strong> Рекорд
                по этой привычке — 20 дней.
              </div>
            </div>
          </div>
        </section>

        {/* Как это работает */}
        <section className="wrap lp-section" id="how">
          <div className="stack" style={{ gap: 'var(--sp-6)' }}>
            <div className="stack" style={{ gap: 10, maxWidth: 620 }}>
              <span className="chip">Как это работает</span>
              <h2 className="t-h1">Четыре шага — и привычка становится частью дня</h2>
              <p className="t-body">
                Никаких сложных настроек: базовый сценарий занимает меньше минуты.
              </p>
            </div>
            <div className="grid grid-4">
              {STEPS.map((step, i) => (
                <div key={step.title} className="lp-card">
                  <div className="stack" style={{ gap: 10 }}>
                    <div className="row-between">
                      <span className="lp-feature-icon">{step.icon}</span>
                      <span className="num muted" style={{ fontSize: 22, fontWeight: 800 }}>
                        {i + 1}
                      </span>
                    </div>
                    <strong>{step.title}</strong>
                    <p className="t-sm muted">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Возможности */}
        <section className="wrap lp-section" id="features">
          <div className="stack" style={{ gap: 'var(--sp-6)' }}>
            <div className="stack" style={{ gap: 10, maxWidth: 620 }}>
              <span className="chip">Ключевые возможности</span>
              <h2 className="t-h1">Всё, что нужно для честного учёта привычек</h2>
            </div>
            <div className="grid grid-3">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="lp-card hover-lift">
                  <div className="lp-feature">
                    <span className="lp-feature-icon" aria-hidden="true">
                      {feature.icon}
                    </span>
                    <div className="stack" style={{ gap: 4, minWidth: 0 }}>
                      <strong className="t-sm">{feature.title}</strong>
                      <span className="t-sm muted">{feature.text}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Пример дашборда */}
        <section className="wrap lp-section" id="dashboard">
          <div className="stack" style={{ gap: 'var(--sp-6)' }}>
            <div className="stack" style={{ gap: 10, maxWidth: 620 }}>
              <span className="chip">Пример дашборда</span>
              <h2 className="t-h1">Так выглядит экран «Сегодня» и статистика</h2>
              <p className="t-body">
                Макеты ниже — визуализация реальных экранов приложения на десктопе и на ширине 360.
              </p>
            </div>

            <div className="lp-grid-2">
              <div className="lp-shot">
                <div style={{ padding: 'var(--sp-4)', borderBottom: '1px solid var(--border)' }}>
                  <strong className="t-sm">Сегодня</strong>
                </div>
                <div style={{ padding: 'var(--sp-4)', display: 'grid', gap: 'var(--sp-4)' }}>
                  <div className="row" style={{ gap: 'var(--sp-4)' }}>
                    <div
                      style={{
                        width: 68,
                        height: 68,
                        flex: 'none',
                        borderRadius: '50%',
                        background: 'conic-gradient(var(--accent) 0 60%, var(--surface-3) 60% 100%)',
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: '50%',
                          background: 'var(--surface)',
                          display: 'grid',
                          placeItems: 'center',
                          fontWeight: 800,
                        }}
                      >
                        3/5
                      </div>
                    </div>
                    <div className="stack grow" style={{ gap: 6, minWidth: 0 }}>
                      <strong className="t-sm">День в процессе</strong>
                      <ProgressBar percent={60} size="sm" />
                      <div className="lp-bar">
                        {[70, 40, 90, 60, 30, 80, 60].map((v, i) => (
                          <div
                            key={i}
                            style={{ background: `color-mix(in srgb, var(--accent) ${v}%, var(--surface-2))` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  {[
                    ['💧', 'Вода', 'Ежедневно · ⏰ 09:00', true, '12', '#2f8aaa'],
                    ['📖', 'Чтение', 'Ежедневно · ⏰ 22:00', true, '20', '#6a4fd0'],
                    ['🏃', 'Пробежка', 'Пн, Ср, Пт · ⏰ 07:00', false, '3', '#2f9e63'],
                    ['📵', 'Без соцсетей', 'Пн–Пт · ⏰ 09:30', false, '5', '#7a6a58'],
                  ].map(([icon, name, meta, done, streak, color]) => (
                    <div key={String(name)} className="row" style={{ gap: 10 }}>
                      <span
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 8,
                          background: done ? String(color) : 'transparent',
                          border: `2px solid ${done ? String(color) : 'var(--border-strong)'}`,
                          color: '#fff',
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        {done && <Icon name="check" size={13} />}
                      </span>
                      <span aria-hidden="true">{icon}</span>
                      <span className="stack grow" style={{ gap: 0, minWidth: 0 }}>
                        <strong className="t-sm truncate">{name}</strong>
                        <span className="t-xs muted truncate">{meta}</span>
                      </span>
                      <span className="chip chip-accent t-xs">🔥 {streak}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lp-shot">
                <div style={{ padding: 'var(--sp-4)', borderBottom: '1px solid var(--border)' }}>
                  <strong className="t-sm">Календарь · тепловая карта</strong>
                </div>
                <div style={{ padding: 'var(--sp-4)', display: 'grid', gap: 'var(--sp-4)' }}>
                  <div className="lp-heat">
                    {Array.from({ length: 35 }, (_, i) => {
                      const level = [0, 2, 3, 1, 4, 4, 3, 2, 0, 1, 3, 4, 4, 2, 0, 3, 3, 4, 1, 2, 4, 3, 4, 2, 0, 1, 2, 4, 3, 4, 2, 1, 0, 3, 4][i]
                      return (
                        <div
                          key={i}
                          style={{
                            background: `var(--heat-${level})`,
                            opacity: level === 0 ? 0.7 : 1,
                          }}
                        />
                      )
                    })}
                  </div>
                  <div className="grid grid-2" style={{ gap: 'var(--sp-3)' }}>
                    <div className="lp-card" style={{ padding: 'var(--sp-4)' }}>
                      <span className="t-xs muted">Текущая серия</span>
                      <div className="num" style={{ fontSize: 28, fontWeight: 800 }}>
                        30 <span style={{ fontSize: 13 }}>дней</span>
                      </div>
                    </div>
                    <div className="lp-card" style={{ padding: 'var(--sp-4)' }}>
                      <span className="t-xs muted">Осталось пропусков</span>
                      <div className="num" style={{ fontSize: 28, fontWeight: 800 }}>
                        2 <span style={{ fontSize: 13 }}>из 5</span>
                      </div>
                    </div>
                  </div>
                  <div className="lp-card" style={{ padding: 'var(--sp-4)' }}>
                    <span className="t-xs muted">Лучше, чем вчера</span>
                    <p className="t-sm" style={{ marginTop: 6 }}>
                      Вчера вы сделали 4/5 привычек. Сегодня 3/5 — подтянитесь!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lp-grid-2">
              <div className="lp-shot">
                <div style={{ padding: 'var(--sp-4)', borderBottom: '1px solid var(--border)' }}>
                  <strong className="t-sm">Мобильная версия · 360 px</strong>
                </div>
                <div style={{ padding: 'var(--sp-4)' }}>
                  <div
                    style={{
                      maxWidth: 300,
                      marginInline: 'auto',
                      border: '7px solid var(--border-strong)',
                      borderRadius: 26,
                      overflow: 'hidden',
                      background: 'var(--bg)',
                    }}
                  >
                    <div style={{ padding: 12, display: 'grid', gap: 8 }}>
                      <div className="row-between">
                        <span className="t-xs muted">7 апреля</span>
                        <span aria-hidden="true">☰</span>
                      </div>
                      <strong className="t-sm">Доброе утро, Алексей</strong>
                      <div className="bar">
                        <div className="bar-fill" style={{ width: '60%' }} />
                      </div>
                      {[
                        ['💧', 'Вода', true],
                        ['📖', 'Чтение', true],
                        ['🏃', 'Пробежка', false],
                      ].map(([icon, name, done]) => (
                        <div
                          key={String(name)}
                          className="row"
                          style={{ gap: 8, padding: '6px 0', borderTop: '1px solid var(--border)' }}
                        >
                          <span aria-hidden="true">{icon}</span>
                          <span className="t-sm grow truncate">{name}</span>
                          <span
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: 7,
                              background: done ? 'var(--accent)' : 'transparent',
                              border: `2px solid ${done ? 'var(--accent)' : 'var(--border-strong)'}`,
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="lp-shot">
                <div style={{ padding: 'var(--sp-4)', borderBottom: '1px solid var(--border)' }}>
                  <strong className="t-sm">Статистика в виде пользы</strong>
                </div>
                <div style={{ padding: 'var(--sp-4)', display: 'grid', gap: 'var(--sp-3)' }}>
                  {[
                    ['📖', 'За месяц: 1,6 книги', '20 дней выполнено из 30', '#6a4fd0'],
                    ['💧', 'За месяц: 60 л воды', '30 дней выполнено из 30', '#2f8aaa'],
                    ['📵', 'За месяц: 120 ч без соцсетей', '22 дня выполнено из 30', '#7a6a58'],
                  ].map(([icon, headline, detail, color]) => (
                    <div key={headline} className="lp-card" style={{ padding: 'var(--sp-4)' }}>
                      <div className="row" style={{ gap: 12 }}>
                        <span
                          aria-hidden="true"
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 12,
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: 19,
                            background: `color-mix(in srgb, ${color} 16%, transparent)`,
                            flex: 'none',
                          }}
                        >
                          {icon}
                        </span>
                        <span className="stack" style={{ gap: 2, minWidth: 0 }}>
                          <strong className="t-sm">{headline}</strong>
                          <span className="t-xs muted">{detail}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Преимущества */}
        <section className="wrap lp-section">
          <div className="stack" style={{ gap: 'var(--sp-6)' }}>
            <div className="stack" style={{ gap: 10, maxWidth: 620 }}>
              <span className="chip">Преимущества</span>
              <h2 className="t-h1">Почему я оставил это себе</h2>
            </div>
            <div className="grid grid-2">
              {ADVANTAGES.map((item, i) => (
                <div key={item.title} className="lp-card hover-lift">
                  <div className="stack" style={{ gap: 8 }}>
                    <span className="num accent-text" style={{ fontWeight: 800, fontSize: 13 }}>
                      0{i + 1}
                    </span>
                    <strong>{item.title}</strong>
                    <p className="t-sm muted">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="wrap lp-section">
          <div
            className="lp-card"
            style={{
              padding: 'var(--sp-7)',
              textAlign: 'center',
              background: 'linear-gradient(135deg, var(--accent-soft), var(--surface))',
              borderColor: 'transparent',
            }}
          >
            <div className="stack" style={{ gap: 'var(--sp-4)', alignItems: 'center' }}>
              <h2 className="t-h1">Начать выстраивать дисциплину сегодня</h2>
              <p className="t-body" style={{ maxWidth: 520 }}>
                Откройте трекер, добавьте первую привычку и поставьте первый чекбокс. Остальное
                трекер посчитает сам.
              </p>
              <div className="lp-cta" style={{ justifyContent: 'center' }}>
                <Link to="/app/today" className="btn btn-primary btn-lg">
                  Открыть трекер
                </Link>
                <Link to="/app/habits/new" className="btn btn-ghost btn-lg">
                  Новая привычка
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-foot">
        <div className="wrap row-between wrap-row" style={{ gap: 'var(--sp-4)' }}>
          <div className="stack" style={{ gap: 4 }}>
            <strong style={{ color: 'var(--text)' }}>Дисциплина — личный трекер привычек</strong>
            <span>Приложение только для владельца: регистрация закрыта, данные хранятся локально.</span>
          </div>
          <div className="row wrap-row" style={{ gap: 'var(--sp-4)' }}>
            <Link to="/app/today" className="t-sm">
              Трекер
            </Link>
            <Link to="/app/stats" className="t-sm">
              Статистика
            </Link>
            <Link to="/app/settings" className="t-sm">
              Настройки
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FlameDot() {
  return (
    <span
      aria-hidden="true"
      style={{
        color: 'var(--accent)',
        fontSize: 12,
      }}
    >
      🔥
    </span>
  )
}
