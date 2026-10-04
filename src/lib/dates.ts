/** Работа с датами в локальной таймзоне. Ключи — YYYY-MM-DD. */

export const DAY_MS = 86_400_000

const MONTHS = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
]

const MONTHS_SHORT = [
  'янв',
  'фев',
  'мар',
  'апр',
  'май',
  'июн',
  'июл',
  'авг',
  'сен',
  'окт',
  'ноя',
  'дек',
]

const WEEKDAYS_FULL = [
  'воскресенье',
  'понедельник',
  'вторник',
  'среда',
  'четверг',
  'пятница',
  'суббота',
]

const WEEKDAYS_SHORT = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']

export const WEEKDAY_LABELS = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']

export function toKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayKey(): string {
  return toKey(new Date())
}

export function monthKey(date: Date | string): string {
  const d = typeof date === 'string' ? fromKey(date) : date
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

export function shiftKey(key: string, amount: number): string {
  return toKey(addDays(fromKey(key), amount))
}

export function daysBetween(fromKeyStr: string, toKeyStr: string): number {
  return Math.round((fromKey(toKeyStr).getTime() - fromKey(fromKeyStr).getTime()) / DAY_MS)
}

/** Диапазон ключей inclusively. */
export function dateRange(from: string, to: string): string[] {
  const out: string[] = []
  let cursor = fromKey(from)
  const end = fromKey(to)
  while (cursor.getTime() <= end.getTime()) {
    out.push(toKey(cursor))
    cursor = addDays(cursor, 1)
  }
  return out
}

export function lastNDays(n: number, end = todayKey()): string[] {
  const endDate = fromKey(end)
  return Array.from({ length: n }, (_, i) => toKey(addDays(endDate, -(n - 1 - i))))
}

/** Понедельник недели, содержащей дату. */
export function startOfWeek(key: string): string {
  const date = fromKey(key)
  const dow = date.getDay()
  const delta = dow === 0 ? -6 : 1 - dow
  return toKey(addDays(date, delta))
}

export function startOfMonthKey(key: string): string {
  const date = fromKey(key)
  return toKey(new Date(date.getFullYear(), date.getMonth(), 1))
}

export function endOfMonthKey(key: string): string {
  const date = fromKey(key)
  return toKey(new Date(date.getFullYear(), date.getMonth() + 1, 0))
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/* ---------- Форматирование ---------- */

export function formatFullDate(key: string): string {
  const d = fromKey(key)
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export function formatDayMonth(key: string): string {
  const d = fromKey(key)
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`
}

export function formatMonthYear(key: string): string {
  const d = fromKey(key)
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`
}

export function weekdayFull(key: string): string {
  return WEEKDAYS_FULL[fromKey(key).getDay()]
}

export function weekdayShort(key: string): string {
  return WEEKDAYS_SHORT[fromKey(key).getDay()]
}

/** «сегодня» / «вчера» / «пн, 3 авг» */
export function relativeDayLabel(key: string): string {
  // diff > 0 — день в будущем, diff < 0 — день в прошлом
  const diff = daysBetween(todayKey(), key)
  if (diff === 0) return 'сегодня'
  if (diff === -1) return 'вчера'
  if (diff === -2) return 'позавчера'
  if (diff === 1) return 'завтра'
  if (diff < 0 && diff > -7) return `${weekdayShort(key)}, ${formatDayMonth(key)}`
  return formatDayMonth(key)
}

export function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 5) return 'Доброй ночи'
  if (hour < 12) return 'Доброе утро'
  if (hour < 18) return 'Добрый день'
  return 'Добрый вечер'
}

export function pluralRu(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n) % 100
  const last = abs % 10
  if (abs > 10 && abs < 20) return many
  if (last > 1 && last < 5) return few
  if (last === 1) return one
  return many
}
