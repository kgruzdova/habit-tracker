import type { Habit } from '../types'
import type { IsDone } from '../lib/stats'
import { getStreak } from '../lib/stats'
import { pluralRu, shiftKey, todayKey } from '../lib/dates'
import { isScheduledFor } from '../lib/frequency'
import { Flame, Icon } from './Icons'

interface Message {
  tone: 'good' | 'soft' | 'warn'
  icon: string
  title: string
  text: string
}

/** Собирает «мягкие напоминания» по вчерашнему дню и сериям. */
function buildMessages(habits: Habit[], isDone: IsDone): Message[] {
  const today = todayKey()
  const yesterday = shiftKey(today, -1)
  const active = habits.filter((h) => !h.archived)

  const plannedYesterday = active.filter((h) => isScheduledFor(h, yesterday))
  const doneYesterday = plannedYesterday.filter((h) => isDone(h.id, yesterday)).length

  const plannedToday = active.filter((h) => isScheduledFor(h, today))
  const doneToday = plannedToday.filter((h) => isDone(h.id, today)).length

  const messages: Message[] = []

  if (plannedYesterday.length > 0 && plannedToday.length > 0) {
    if (doneToday < doneYesterday && doneYesterday > 0) {
      messages.push({
        tone: 'soft',
        icon: '💪',
        title: 'Подтянитесь',
        text: `Вчера вы сделали ${doneYesterday} из ${plannedYesterday.length}. Сегодня ${doneToday} из ${plannedToday.length} — подтянитесь!`,
      })
    } else if (doneToday > doneYesterday) {
      messages.push({
        tone: 'good',
        icon: '🚀',
        title: 'Лучше, чем вчера',
        text: `Вчера было ${doneYesterday} из ${plannedYesterday.length}, сегодня уже ${doneToday} из ${plannedToday.length}. Отличный темп.`,
      })
    } else if (doneToday === 0 && plannedToday.length > 0) {
      messages.push({
        tone: 'warn',
        icon: '😅',
        title: 'Пока ни одной отметки',
        text: 'Сегодня ещё ничего не отмечено. Начни с одной привычки — дальше будет легче.',
      })
    } else if (doneToday === doneYesterday) {
      messages.push({
        tone: 'good',
        icon: '⚖️',
        title: 'Стабильность',
        text: `${doneToday} из ${plannedToday.length} — ровно как вчера. Держим темп.`,
      })
    }
  }

  // Держитесь дольше, чем в прошлый раз
  for (const habit of active) {
    const { current, best } = getStreak(habit, isDone)
    if (current > 0 && best > current) {
      messages.push({
        tone: 'good',
        icon: '🔥',
        title: `${habit.name}: ${current} ${pluralRu(current, 'день', 'дня', 'дней')} подряд`,
        text: `Рекорд по этой привычке — ${best} ${pluralRu(best, 'день', 'дня', 'дней')}. Подтянемся?`,
      })
      break
    }
    if (current >= 7 && current === best) {
      messages.push({
        tone: 'good',
        icon: '⚡',
        title: `${habit.name}: ${current} ${pluralRu(current, 'день', 'дня', 'дней')} без срывов`,
        text: 'Это личный рекорд. Идеальная серия — не срываем.',
      })
      break
    }
  }

  // Мягкое напоминание, если серия прервалась
  if (messages.length === 0) {
    const broken = active.find((h) => {
      const { current, best } = getStreak(h, isDone)
      return best > 0 && current === 0
    })
    if (broken) {
      messages.push({
        tone: 'warn',
        icon: '🌤️',
        title: `Серия «${broken.name}» прервалась`,
        text: 'Ничего страшного. Начните заново — один день не срывает всю работу.',
      })
    }
  }

  if (messages.length === 0) {
    messages.push({
      tone: 'good',
      icon: '🎯',
      title: 'Ровный старт',
      text: 'Отмечайте привычки каждый день — и трекер подскажет, где вы были сильнее всего.',
    })
  }

  return messages.slice(0, 3)
}

const TONES: Record<Message['tone'], { bg: string; color: string; chip: string }> = {
  good: { bg: 'var(--ok-soft)', color: 'var(--ok)', chip: 'chip-ok' },
  soft: { bg: 'var(--accent-soft)', color: 'var(--accent)', chip: 'chip-accent' },
  warn: { bg: 'var(--warn-soft)', color: 'var(--warn)', chip: 'chip-warn' },
}

export function BetterThanYesterday({ habits, isDone }: { habits: Habit[]; isDone: IsDone }) {
  const messages = buildMessages(habits, isDone)

  return (
    <section aria-label="Лучше, чем вчера">
      <div className="card-head">
        <h2 className="card-title">
          <Flame size={19} /> Лучше, чем вчера
        </h2>
      </div>
      <div className="grid grid-2">
        {messages.map((message, i) => {
          const tone = TONES[message.tone]
          return (
            <div
              key={`${message.title}-${i}`}
              className="card hover-lift"
              style={{ background: tone.bg, borderColor: 'transparent', padding: 'var(--sp-4)' }}
            >
              <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
                <span aria-hidden="true" style={{ fontSize: 24, lineHeight: 1.2 }}>
                  {message.icon}
                </span>
                <div className="stack grow" style={{ gap: 4, minWidth: 0 }}>
                  <strong style={{ fontSize: 14.5 }}>{message.title}</strong>
                  <p className="t-sm" style={{ color: 'var(--text-2)' }}>
                    {message.text}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="row" style={{ gap: 8, marginTop: 'var(--sp-3)', flexWrap: 'wrap' }}>
        <span className="chip">
          <Icon name="spark" size={13} /> Мягкие напоминания без чувства вины
        </span>
      </div>
    </section>
  )
}
