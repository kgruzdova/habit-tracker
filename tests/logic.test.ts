import { describe, expect, it } from 'vitest'
import { seedData, completionKey, DEFAULT_CATEGORIES } from '../src/lib/storage'
import { makeIsDone, getStreak, rangeStat, dailySummaries, monthGrid, lifetimeStats, topHabits, weekCompletionText, skipInfo } from '../src/lib/stats'
import { isScheduledFor, frequencyLabel } from '../src/lib/frequency'
import { lastNDays, shiftKey, todayKey, startOfWeek, relativeDayLabel, pluralRu } from '../src/lib/dates'
import type { Habit } from '../src/types'

function habit(over: Partial<Habit> = {}): Habit {
  return {
    id: 'h1',
    name: 'Тест',
    icon: '🎯',
    color: '#e2622c',
    categoryId: null,
    frequency: { kind: 'daily' },
    reminder: null,
    unit: null,
    skipAllowance: 2,
    archived: false,
    createdAt: shiftKey(todayKey(), -30),
    ...over,
  }
}

describe('dates', () => {
  it('последние N дней заканчиваются сегодня', () => {
    const days = lastNDays(3)
    expect(days).toHaveLength(3)
    expect(days[2]).toBe(todayKey())
  })

  it('неделя начинается с понедельника', () => {
    expect(startOfWeek('2024-04-07')).toBe('2024-04-01') // воскресенье → пн 1 апреля
    expect(startOfWeek('2024-04-01')).toBe('2024-04-01') // понедельник
  })

  it('склоняет числительные', () => {
    expect(pluralRu(1, 'день', 'дня', 'дней')).toBe('день')
    expect(pluralRu(3, 'день', 'дня', 'дней')).toBe('дня')
    expect(pluralRu(7, 'день', 'дня', 'дней')).toBe('дней')
    expect(pluralRu(11, 'день', 'дня', 'дней')).toBe('дней')
  })

  it('подписывает относительные дни', () => {
    expect(relativeDayLabel(todayKey())).toBe('сегодня')
    expect(relativeDayLabel(shiftKey(todayKey(), -1))).toBe('вчера')
  })
})

describe('frequency', () => {
  it('ежедневная привычка запланирована всегда', () => {
    expect(isScheduledFor(habit(), todayKey())).toBe(true)
  })

  it('по дням недели учитывает выбранные дни', () => {
    const h = habit({ frequency: { kind: 'weekdays', days: [1, 3, 5] } })
    // 2024-04-01 — понедельник
    expect(isScheduledFor(h, '2024-04-01')).toBe(true)
    expect(isScheduledFor(h, '2024-04-02')).toBe(false)
    expect(isScheduledFor(h, '2024-04-03')).toBe(true)
    expect(frequencyLabel(h)).toBe('пн, ср, пт')
  })

  it('архивная привычка ничего не планирует', () => {
    expect(isScheduledFor(habit({ archived: true }), todayKey())).toBe(false)
  })
})

describe('streaks', () => {
  it('считает текущую серию подряд', () => {
    const h = habit()
    const data = seedData()
    // Подготавливаем данные вручную
    const completions: Record<string, boolean> = {}
    for (let i = 0; i < 5; i += 1) completions[completionKey(h.id, shiftKey(todayKey(), -i))] = true
    const local = { ...data, habits: [h], completions }
    const done = makeIsDone(local)
    expect(getStreak(h, done).current).toBe(5)
    expect(getStreak(h, done).best).toBe(5)
  })

  it('не обнуляет серию, если сегодня ещё не отмечено', () => {
    const h = habit()
    const data = seedData()
    const completions: Record<string, boolean> = {}
    for (let i = 1; i <= 3; i += 1) completions[completionKey(h.id, shiftKey(todayKey(), -i))] = true
    const local = { ...data, habits: [h], completions }
    expect(getStreak(h, makeIsDone(local)).current).toBe(3)
  })

  it('считает лучшую серию за всю историю', () => {
    const h = habit()
    const data = seedData()
    const completions: Record<string, boolean> = {}
    // Непрерывная полоса с -10 по -3 — это 8 дней, сегодня отдельная отметка
    for (let i = 3; i <= 10; i += 1) completions[completionKey(h.id, shiftKey(todayKey(), -i))] = true
    completions[completionKey(h.id, todayKey())] = true
    const local = { ...data, habits: [h], completions }
    const streak = getStreak(h, makeIsDone(local))
    expect(streak.best).toBe(8)
    expect(streak.current).toBe(1)
  })
})

describe('range stats', () => {
  it('не учитывает будущие дни', () => {
    const h = habit()
    const data = seedData()
    const stat = rangeStat(h, makeIsDone(data), lastNDays(7))
    expect(stat.planned).toBeLessThanOrEqual(7)
    expect(stat.percent).toBeGreaterThanOrEqual(0)
  })

  it('дни вне периодичности не входят в план', () => {
    const h = habit({ frequency: { kind: 'weekdays', days: [1] } })
    const data = seedData()
    const stat = rangeStat(h, makeIsDone(data), lastNDays(7))
    expect(stat.planned).toBe(1)
  })
})

describe('calendar', () => {
  it('сетка месяца начинается с понедельника и содержит все дни', () => {
    const cells = monthGrid('2024-04-15')
    const days = cells.filter((c): c is string => Boolean(c))
    expect(days).toHaveLength(30)
    expect(days[0]).toBe('2024-04-01')
    expect(days[29]).toBe('2024-04-30')
    // 1 апреля 2024 — понедельник, ведущих пустых ячеек быть не должно
    expect(cells[0]).not.toBeNull()
  })

  it('сводка дня считает выполненные и плановые', () => {
    const data = seedData()
    const summaries = dailySummaries(data, lastNDays(7))
    expect(summaries).toHaveLength(7)
    for (const s of summaries) {
      expect(s.done).toBeLessThanOrEqual(s.planned)
    }
  })
})

describe('week text & skips', () => {
  it('не превышает цель по дням', () => {
    const data = seedData()
    const h = data.habits.find((x) => x.frequency.kind === 'weekdays')!
    const text = weekCompletionText(h, makeIsDone(data))
    expect(text).toMatch(/^\d+\/\d+ дней на этой неделе$/)
  })

  it('остаток пропусков не отрицательный', () => {
    const data = seedData()
    const h = data.habits[0]
    const info = skipInfo(data, h)
    expect(info.left).toBeGreaterThanOrEqual(0)
  })
})

describe('overall stats', () => {
  it('считает показатели без пустых значений', () => {
    const data = seedData()
    const life = lifetimeStats(data)
    expect(life.activeHabits).toBeGreaterThan(0)
    expect(life.totalMarks).toBeGreaterThan(0)
    expect(life.overallPercent).toBeGreaterThanOrEqual(0)
    expect(life.overallPercent).toBeLessThanOrEqual(100)
  })

  it('рейтинг отсортирован по проценту', () => {
    const data = seedData()
    const ranks = topHabits(data, 30)
    for (let i = 1; i < ranks.length; i += 1) {
      expect(ranks[i - 1].percent).toBeGreaterThanOrEqual(ranks[i].percent)
    }
  })
})

describe('seed & defaults', () => {
  it('девять категорий по умолчанию', () => {
    expect(DEFAULT_CATEGORIES).toHaveLength(9)
  })

  it('демо-данные дают непустую статистику', () => {
    const data = seedData()
    const isDone = makeIsDone(data)
    const h = data.habits[0]
    expect(totalDoneOf(h, isDone)).toBeGreaterThan(0)
    expect(getStreak(h, isDone).best).toBeGreaterThan(0)
  })
})

function totalDoneOf(h: Habit, isDone: ReturnType<typeof makeIsDone>): number {
  let count = 0
  for (const day of lastNDays(60)) if (isDone(h.id, day)) count += 1
  return count
}
