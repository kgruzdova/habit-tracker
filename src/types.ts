export type ThemeName = 'light' | 'dark'

/** Периодичность привычки */
export type Frequency =
  | { kind: 'daily' }
  | { kind: 'weekdays'; days: number[] }
  | { kind: 'timesPerWeek'; times: number }

export type CategoryId = string
export type HabitId = string
/** Ключ отметки: привычка + дата в формате YYYY-MM-DD */
export type CompletionKey = string

export interface Category {
  id: CategoryId
  name: string
  icon: string
  color: string
  /** Встроенные категории не удаляются, но переименовывать можно */
  system?: boolean
  createdAt: string
}

export interface Habit {
  id: HabitId
  name: string
  note?: string
  icon: string
  color: string
  categoryId: CategoryId | null
  frequency: Frequency
  /** Напоминание в формате HH:mm */
  reminder: string | null
  /** Единица измерения для отображения цели, например «стаканов» */
  unit: string | null
  /** Сколько раз в месяц можно пропустить */
  skipAllowance: number
  archived: boolean
  createdAt: string
}

export interface Settings {
  name: string
  theme: ThemeName
  notifyPush: boolean
  notifyEmail: boolean
}

export interface AppData {
  habits: Habit[]
  categories: Category[]
  /** Карта отметок: `${habitId}|${date}` -> true */
  completions: Record<CompletionKey, boolean>
  /** Пропуски за месяц: `${habitId}|${YYYY-MM}` -> число явных пропусков */
  skips: Record<string, number>
  settings: Settings
}
