import type { Habit } from '../types'
import type { IsDone } from '../lib/stats'
import { totalDone } from '../lib/stats'
import { lastNDays, pluralRu } from '../lib/dates'
import { Donut } from './Charts'
import { isScheduledFor } from '../lib/frequency'

interface Benefit {
  icon: string
  color: string
  headline: string
  detail: string
  percent: number
  habitName?: string
}

interface UnitRule {
  unit: string
  perDay: number
  convert?: (monthTotal: number) => string
}

const PER_DAY_TARGET: Record<string, UnitRule> = {
  'h-water': {
    unit: 'стаканов',
    perDay: 8,
    convert: (t) => `${Math.round((t * 250) / 100) / 10} л воды`,
  },
  'h-books': {
    unit: 'страниц',
    perDay: 20,
    convert: (t) => `${(t / 250).toFixed(1).replace('.', ',')} книги`,
  },
  'h-social': {
    unit: 'минут',
    perDay: 480,
    convert: (t) => `${Math.floor(t / 60)} ч без соцсетей`,
  },
}

/** Стандартные цели для привычек с единицей измерения. */
const GENERIC_TARGET: Record<string, number> = {
  стаканов: 8,
  страниц: 20,
  минут: 30,
  км: 5,
  часов: 8,
  раз: 1,
  шагов: 8000,
  листов: 2,
}

/** Собирает «статистику в виде пользы» за последние 30 дней. */
function buildBenefits(habits: Habit[], isDone: IsDone): Benefit[] {
  const days = lastNDays(30)
  const active = habits.filter((h) => !h.archived)
  const out: Benefit[] = []

  for (const habit of active) {
    const rule = PER_DAY_TARGET[habit.id]
    const unit = habit.unit ?? rule?.unit
    if (!unit) continue
    const perDay = rule?.perDay ?? GENERIC_TARGET[unit] ?? 1
    const done = totalDone(habit, isDone)
    const planned = days.filter((d) => isScheduledFor(habit, d)).length
    const percent = planned === 0 ? 0 : Math.round((done / planned) * 100)
    const monthTotal = done * perDay
    const converted = rule?.convert ? rule.convert(monthTotal) : `${monthTotal} ${unit}`

    out.push({
      icon: habit.icon,
      color: habit.color,
      headline: `За месяц: ${converted}`,
      detail: `${done} ${pluralRu(done, 'день', 'дня', 'дней')} выполнено из ${planned}`,
      percent,
      habitName: habit.name,
    })
  }

  const withData = out.filter((b) => b.percent > 0)
  withData.sort((a, b) => b.percent - a.percent)
  return withData.slice(0, 3)
}

export function BenefitsBlock({ habits, isDone }: { habits: Habit[]; isDone: IsDone }) {
  const benefits = buildBenefits(habits, isDone)

  if (benefits.length === 0) {
    return (
      <section aria-label="Статистика в виде пользы">
        <div className="card-head">
          <h2 className="card-title">📈 Статистика в виде пользы</h2>
        </div>
        <div className="card">
          <p className="t-sm muted">
            Добавьте привычку с единицей измерения — и здесь появятся понятные итоги: книги,
            литры, сэкономленные часы.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section aria-label="Статистика в виде пользы">
      <div className="card-head">
        <h2 className="card-title">📈 Статистика в виде пользы</h2>
        <span className="chip">за 30 дней</span>
      </div>
      <div className="grid grid-3">
        {benefits.map((benefit) => (
          <div key={benefit.habitName} className="card hover-lift" style={{ padding: 'var(--sp-4)' }}>
            <div className="row" style={{ gap: 'var(--sp-4)' }}>
              <Donut percent={benefit.percent} size={74} stroke={8} color={benefit.color}>
                <span aria-hidden="true" style={{ fontSize: 22 }}>
                  {benefit.icon}
                </span>
              </Donut>
              <div className="stack grow" style={{ gap: 3, minWidth: 0 }}>
                <strong className="t-sm" style={{ lineHeight: 1.35 }}>
                  {benefit.headline}
                </strong>
                <span className="t-xs muted">{benefit.detail}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
