import type { AppData, Habit } from '../types'
import {
  daysInMonth,
  fromKey,
  lastNDays,
  monthKey,
  startOfMonthKey,
  startOfWeek,
  toKey,
  todayKey,
} from './dates'
import { isScheduledFor, isWeekQuotaMet, weekTarget } from './frequency'
import { completionKey, skipKey } from './storage'

export interface StreakInfo {
  current: number
  best: number
}

export type IsDone = (habitId: string, date: string) => boolean

export function makeIsDone(data: AppData): IsDone {
  return (habitId, date) => Boolean(data.completions[completionKey(habitId, date)])
}

/** Текущая и лучшая серия выполнения подряд (по плановым дням). */
export function getStreak(habit: Habit, isDone: IsDone, from = todayKey()): StreakInfo {
  const start = habit.createdAt < from ? habit.createdAt : from

  // Все плановые дни от появления привычки до выбранной даты
  const scheduled: string[] = []
  let cursor = start
  let guard = 0
  while (compareKeys(cursor, from) <= 0 && guard < 1200) {
    if (isScheduledFor(habit, cursor)) scheduled.push(cursor)
    cursor = addDaysLocal(cursor, 1)
    guard += 1
  }

  // Лучшая серия — самая длинная полоса выполненных плановых дней
  let best = 0
  let run = 0
  for (const day of scheduled) {
    if (isDone(habit.id, day)) {
      run += 1
      if (run > best) best = run
    } else {
      run = 0
    }
  }

  // Текущая серия — считаем с конца. Если сегодняшний день ещё не отмечен,
  // серия продолжается вчерашним днём: показываем её, а не ноль.
  let current = 0
  let index = scheduled.length - 1
  if (index >= 0 && scheduled[index] === from && !isDone(habit.id, from)) index -= 1
  for (; index >= 0; index -= 1) {
    if (isDone(habit.id, scheduled[index])) current += 1
    else break
  }

  return { current, best }
}

export interface RangeStat {
  planned: number
  done: number
  percent: number
}

export function rangeStat(habit: Habit, isDone: IsDone, days: string[]): RangeStat {
  let planned = 0
  let done = 0
  for (const day of days) {
    if (!isScheduledFor(habit, day)) continue
    if (compareKeys(day, todayKey()) > 0) continue
    planned += 1
    if (isDone(habit.id, day)) done += 1
  }
  const percent = planned === 0 ? 0 : Math.round((done / planned) * 100)
  return { planned, done, percent }
}

export function last7(habit: Habit, isDone: IsDone): RangeStat {
  return rangeStat(habit, isDone, lastNDays(7))
}

export function last15(habit: Habit, isDone: IsDone): RangeStat {
  return rangeStat(habit, isDone, lastNDays(15))
}

export function last30(habit: Habit, isDone: IsDone): RangeStat {
  return rangeStat(habit, isDone, lastNDays(30))
}

/** Выполнение по дням за период — для графика. */
export function dailySeries(habit: Habit, isDone: IsDone, days: string[]): (number | null)[] {
  return days.map((day) => {
    if (compareKeys(day, todayKey()) > 0) return null
    if (!isScheduledFor(habit, day)) return null
    return isDone(habit.id, day) ? 100 : 0
  })
}

/** Выполнение по неделям за N недель (средний процент). */
export function weeklySeries(
  habit: Habit,
  isDone: IsDone,
  weeks: number,
): { label: string; percent: number }[] {
  const out: { label: string; percent: number }[] = []
  const thisWeek = startOfWeek(todayKey())
  for (let i = weeks - 1; i >= 0; i -= 1) {
    const start = addDaysLocal(thisWeek, -7 * i)
    const days = Array.from({ length: 7 }, (_, k) => addDaysLocal(start, k))
    const stat = rangeStat(habit, isDone, days)
    const d = fromKey(start)
    out.push({ label: `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`, percent: stat.percent })
  }
  return out
}

/** Сколько раз выполнено за всю историю. */
export function totalDone(habit: Habit, isDone: IsDone): number {
  let count = 0
  let cursor = habit.createdAt
  const today = todayKey()
  let guard = 0
  while (compareKeys(cursor, today) <= 0 && guard < 800) {
    guard += 1
    if (isDone(habit.id, cursor)) count += 1
    cursor = addDaysLocal(cursor, 1)
  }
  return count
}

/* ---------- Общая статистика ---------- */

export interface DaySummary {
  key: string
  done: number
  planned: number
  percent: number
}

export function dailySummaries(data: AppData, days: string[]): DaySummary[] {
  const isDone = makeIsDone(data)
  return days.map((key) => {
    let done = 0
    let planned = 0
    for (const habit of data.habits) {
      if (habit.archived) continue
      if (!isScheduledFor(habit, key)) continue
      if (compareKeys(key, todayKey()) > 0) continue
      planned += 1
      if (isDone(habit.id, key)) done += 1
    }
    return {
      key,
      done,
      planned,
      percent: planned === 0 ? 0 : Math.round((done / planned) * 100),
    }
  })
}

export interface HabitRank {
  habit: Habit
  percent: number
  done: number
}

export function topHabits(data: AppData, days = 30): HabitRank[] {
  const isDone = makeIsDone(data)
  return data.habits
    .filter((h) => !h.archived)
    .map((habit) => {
      const stat = rangeStat(habit, isDone, lastNDays(days))
      return { habit, percent: stat.percent, done: stat.done }
    })
    .sort((a, b) => b.percent - a.percent)
}

export interface PeriodBest {
  label: string
  detail: string
  percent: number
}

export function bestDay(data: AppData): PeriodBest | null {
  const summaries = dailySummaries(data, lastNDays(120)).filter((s) => s.planned > 0)
  if (!summaries.length) return null
  const best = summaries.reduce((a, b) => (b.percent > a.percent ? b : a))
  return {
    label: fromKey(best.key).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }),
    detail: `${best.done} из ${best.planned}`,
    percent: best.percent,
  }
}

export function bestWeek(data: AppData): PeriodBest | null {
  const summaries = dailySummaries(data, lastNDays(84))
  const weeks: { start: string; done: number; planned: number }[] = []
  for (const summary of summaries) {
    const w = startOfWeek(summary.key)
    const found = weeks.find((x) => x.start === w)
    if (found) {
      found.done += summary.done
      found.planned += summary.planned
    } else {
      weeks.push({ start: w, done: summary.done, planned: summary.planned })
    }
  }
  const valid = weeks.filter((w) => w.planned > 0)
  if (!valid.length) return null
  const best = valid.reduce((a, b) => (b.done / b.planned > a.done / a.planned ? b : a))
  const percent = Math.round((best.done / best.planned) * 100)
  return {
    label: `Неделя с ${fromKey(best.start).getDate()}.${String(fromKey(best.start).getMonth() + 1).padStart(2, '0')}`,
    detail: `${best.done} отметок`,
    percent,
  }
}

export function bestMonth(data: AppData): PeriodBest | null {
  const months = new Map<string, { done: number; planned: number }>()
  const summaries = dailySummaries(data, lastNDays(365))
  for (const summary of summaries) {
    const m = monthKey(summary.key)
    const found = months.get(m)
    if (found) {
      found.done += summary.done
      found.planned += summary.planned
    } else {
      months.set(m, { done: summary.done, planned: summary.planned })
    }
  }
  const valid = [...months.entries()].filter(([, v]) => v.planned > 0)
  if (!valid.length) return null
  const [key, value] = valid.reduce((a, b) => (b[1].done / b[1].planned > a[1].done / a[1].planned ? b : a))
  const percent = Math.round((value.done / value.planned) * 100)
  return {
    label: fromKey(`${key}-01`).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }),
    detail: `${value.done} отметок`,
    percent,
  }
}

export interface LifetimeStats {
  totalMarks: number
  activeHabits: number
  archivedHabits: number
  daysTracked: number
  overallPercent: number
  longestStreakOverall: number
}

export function lifetimeStats(data: AppData): LifetimeStats {
  const isDone = makeIsDone(data)
  const active = data.habits.filter((h) => !h.archived)
  let totalMarks = 0
  for (const habit of data.habits) totalMarks += totalDone(habit, isDone)

  const earliest = data.habits.reduce<string | null>((acc, h) => {
    if (!acc) return h.createdAt
    return h.createdAt < acc ? h.createdAt : acc
  }, null)
  const daysTracked = earliest
    ? Math.max(1, Math.round((fromKey(todayKey()).getTime() - fromKey(earliest).getTime()) / 86_400_000) + 1)
    : 0

  const monthSummaries = dailySummaries(data, lastNDays(30))
  const planned = monthSummaries.reduce((sum, s) => sum + s.planned, 0)
  const done = monthSummaries.reduce((sum, s) => sum + s.done, 0)

  let longestStreakOverall = 0
  for (const habit of active) {
    const streak = getStreak(habit, isDone)
    if (streak.best > longestStreakOverall) longestStreakOverall = streak.best
  }

  return {
    totalMarks,
    activeHabits: active.length,
    archivedHabits: data.habits.length - active.length,
    daysTracked,
    overallPercent: planned === 0 ? 0 : Math.round((done / planned) * 100),
    longestStreakOverall,
  }
}

/* ---------- Пропуски ---------- */

export interface SkipInfo {
  used: number
  allowance: number
  left: number
  monthLabel: string
}

export function skipInfo(data: AppData, habit: Habit, on = todayKey()): SkipInfo {
  const used = data.skips[skipKey(habit.id, on)] ?? 0
  const d = fromKey(on)
  return {
    used,
    allowance: habit.skipAllowance,
    left: Math.max(0, habit.skipAllowance - used),
    monthLabel: d.toLocaleDateString('ru-RU', { month: 'long' }),
  }
}

/* ---------- Серия по дням недели ---------- */

export function weekCompletionText(habit: Habit, isDone: IsDone): string {
  const weekStart = startOfWeek(todayKey())
  const today = todayKey()
  const days = Array.from({ length: 7 }, (_, i) => addDaysLocal(weekStart, i))
  const target = weekTarget(habit)
  const done = days.filter(
    (day) => compareKeys(day, today) <= 0 && isScheduledFor(habit, day) && isDone(habit.id, day),
  ).length
  return `${done}/${target} дней на этой неделе`
}

export function weekQuotaMet(habit: Habit, isDone: IsDone): boolean {
  return isWeekQuotaMet(habit, isDone, startOfWeek(todayKey()))
}

/* ---------- Календарь ---------- */

export function monthGrid(anchor: string): (string | null)[] {
  const start = startOfMonthKey(anchor)
  const first = fromKey(start)
  const leading = (first.getDay() + 6) % 7
  const total = daysInMonth(first.getFullYear(), first.getMonth())
  const cells: (string | null)[] = Array.from({ length: leading }, () => null)
  for (let i = 0; i < total; i += 1) {
    const d = new Date(first.getFullYear(), first.getMonth(), i + 1)
    cells.push(toKey(d))
  }
  return cells
}

/* ---------- Хелперы дат ---------- */

function addDaysLocal(key: string, amount: number): string {
  const d = fromKey(key)
  d.setDate(d.getDate() + amount)
  return toKey(d)
}

function compareKeys(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}
