import type { Habit } from '../types'
import { fromKey, startOfWeek, todayKey } from './dates'

/** Планируется ли привычка на указанный день. */
export function isScheduledFor(habit: Habit, key: string): boolean {
  if (habit.archived) return false
  const dow = fromKey(key).getDay()
  switch (habit.frequency.kind) {
    case 'daily':
      return true
    case 'weekdays':
      return habit.frequency.days.includes(dow)
    case 'timesPerWeek':
      // Привычка «X раз в неделю» доступна каждый день, лимит считается за неделю
      return true
  }
}

export function frequencyLabel(habit: Habit): string {
  switch (habit.frequency.kind) {
    case 'daily':
      return 'Ежедневно'
    case 'weekdays': {
      const days = [...habit.frequency.days].sort((a, b) => a - b)
      if (days.length === 0) return 'Дни не выбраны'
      if (days.length === 7) return 'Ежедневно'
      const names = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']
      return days.map((d) => names[d]).join(', ')
    }
    case 'timesPerWeek':
      return `${habit.frequency.times} раз в неделю`
  }
}

/** Сколько раз за неделю нужно выполнить для «timesPerWeek»-привычек. */
export function weekTarget(habit: Habit): number {
  switch (habit.frequency.kind) {
    case 'daily':
      return 7
    case 'weekdays':
      return habit.frequency.days.length
    case 'timesPerWeek':
      return habit.frequency.times
  }
}

/** Выполнено ли плановое число раз за текущую неделю (для timesPerWeek). */
export function isWeekQuotaMet(
  habit: Habit,
  isDone: (habitId: string, key: string) => boolean,
  weekStart: string,
): boolean {
  if (habit.frequency.kind !== 'timesPerWeek') return false
  let done = 0
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(fromKey(weekStart))
    d.setDate(d.getDate() + i)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    if (isDone(habit.id, `${y}-${m}-${dd}`)) done += 1
  }
  return done >= habit.frequency.times
}

/** Текущая неделя начинается с понедельника. */
export function currentWeekStart(): string {
  return startOfWeek(todayKey())
}
