import type { AppData, Category, CompletionKey, Habit, Settings } from '../types'
import { monthKey, todayKey } from './dates'

const STORAGE_KEY = 'habit-tracker:v1'

export function completionKey(habitId: string, date: string): CompletionKey {
  return `${habitId}|${date}`
}

export function skipKey(habitId: string, date: string): string {
  return `${habitId}|${monthKey(date)}`
}

export const HABIT_ICONS = [
  '🏃',
  '💧',
  '📖',
  '🧘',
  '🏋️',
  '🥗',
  '😴',
  '💊',
  '✍️',
  '🎸',
  '🌱',
  '🧹',
  '🦷',
  '💰',
  '📵',
  '☀️',
  '🧠',
  '🎯',
] as const

export const CATEGORY_ICONS = [
  '❤️',
  '💼',
  '🎓',
  '⚽',
  '🥗',
  '🏠',
  '🚭',
  '🎨',
  '🌙',
  '💰',
  '🧘',
  '🐶',
  '✈️',
  '🔧',
  '📌',
] as const

export const HABIT_COLORS = [
  '#e2622c',
  '#d3453f',
  '#d99514',
  '#2f9e63',
  '#1f8a8a',
  '#2f6fd0',
  '#6a4fd0',
  '#c0399f',
  '#7a6a58',
] as const

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-health', name: 'Здоровье', icon: '❤️', color: '#d3453f', system: true, createdAt: '2024-01-01' },
  { id: 'cat-work', name: 'Работа', icon: '💼', color: '#2f6fd0', system: true, createdAt: '2024-01-01' },
  { id: 'cat-education', name: 'Образование', icon: '🎓', color: '#6a4fd0', system: true, createdAt: '2024-01-01' },
  { id: 'cat-sport', name: 'Спорт', icon: '⚽', color: '#2f9e63', system: true, createdAt: '2024-01-01' },
  { id: 'cat-food', name: 'Питание', icon: '🥗', color: '#d99514', system: true, createdAt: '2024-01-01' },
  { id: 'cat-home', name: 'Дом', icon: '🏠', color: '#7a6a58', system: true, createdAt: '2024-01-01' },
  { id: 'cat-bad', name: 'Вредные привычки', icon: '🚭', color: '#7a6a58', system: true, createdAt: '2024-01-01' },
  { id: 'cat-creative', name: 'Творчество', icon: '🎨', color: '#c0399f', system: true, createdAt: '2024-01-01' },
  { id: 'cat-sleep', name: 'Сон', icon: '🌙', color: '#1f8a8a', system: true, createdAt: '2024-01-01' },
]

export const DEFAULT_SETTINGS: Settings = {
  name: 'Друг',
  theme: 'light',
  notifyPush: true,
  notifyEmail: false,
}

export function emptyData(): AppData {
  return {
    habits: [],
    categories: DEFAULT_CATEGORIES.map((c) => ({ ...c })),
    completions: {},
    skips: {},
    settings: { ...DEFAULT_SETTINGS },
  }
}

export function loadData(): AppData {
  if (typeof window === 'undefined') return emptyData()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyData()
    const parsed = JSON.parse(raw) as Partial<AppData>
    const base = emptyData()
    return {
      habits: parsed.habits ?? base.habits,
      categories: parsed.categories?.length ? parsed.categories : base.categories,
      completions: parsed.completions ?? {},
      skips: parsed.skips ?? {},
      settings: { ...base.settings, ...(parsed.settings ?? {}) },
    }
  } catch {
    return emptyData()
  }
}

export function saveData(data: AppData): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Квота или приватный режим — молча игнорируем
  }
}

export function exportData(data: AppData): string {
  return JSON.stringify(data, null, 2)
}

export function downloadJson(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** Демо-данные, чтобы приложение не выглядело пустым при первом запуске. */
export function seedData(): AppData {
  const now = new Date()

  const habits: Habit[] = [
    {
      id: 'h-water',
      name: 'Вода',
      note: '8 стаканов в день',
      icon: '💧',
      color: '#2f8aaa',
      categoryId: 'cat-health',
      frequency: { kind: 'daily' },
      reminder: '09:00',
      unit: 'стаканов',
      skipAllowance: 2,
      archived: false,
      createdAt: '',
    },
    {
      id: 'h-books',
      name: 'Чтение',
      note: '20 страниц перед сном',
      icon: '📖',
      color: '#6a4fd0',
      categoryId: 'cat-education',
      frequency: { kind: 'daily' },
      reminder: '22:00',
      unit: 'страниц',
      skipAllowance: 3,
      archived: false,
      createdAt: '',
    },
    {
      id: 'h-run',
      name: 'Пробежка',
      note: 'Утренняя кардио-сессия',
      icon: '🏃',
      color: '#2f9e63',
      categoryId: 'cat-sport',
      frequency: { kind: 'weekdays', days: [1, 3, 5] },
      reminder: '07:00',
      unit: 'км',
      skipAllowance: 4,
      archived: false,
      createdAt: '',
    },
    {
      id: 'h-social',
      name: 'Без соцсетей',
      note: 'Рабочее время без телефона',
      icon: '📵',
      color: '#7a6a58',
      categoryId: 'cat-bad',
      frequency: { kind: 'weekdays', days: [1, 2, 3, 4, 5] },
      reminder: '09:30',
      unit: 'минут',
      skipAllowance: 2,
      archived: false,
      createdAt: '',
    },
    {
      id: 'h-sleep',
      name: 'Ложиться до 23:00',
      icon: '🌙',
      color: '#1f8a8a',
      categoryId: 'cat-sleep',
      frequency: { kind: 'daily' },
      reminder: '22:45',
      unit: null,
      skipAllowance: 2,
      archived: false,
      createdAt: '',
    },
  ]

  const completions: Record<string, boolean> = {}
  const skips: Record<string, number> = {}

  // Привычки «живут» 60 дней — чтобы серии и графики были непустыми
  const created = new Date(now)
  created.setDate(created.getDate() - 60)
  const createdIso = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}-${String(created.getDate()).padStart(2, '0')}`
  habits.forEach((habit) => {
    habit.createdAt = createdIso
  })

  habits.forEach((habit, hIndex) => {
    for (let back = 0; back < 60; back += 1) {
      const d = new Date(now)
      d.setDate(d.getDate() - back)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const dow = d.getDay()
      const scheduled =
        habit.frequency.kind === 'daily'
          ? true
          : habit.frequency.kind === 'weekdays'
            ? habit.frequency.days.includes(dow)
            : true
      if (!scheduled) continue

      // Детерминированная «история»: у каждой привычки своя волна успехов
      const wave = Math.sin((back + 2) * 0.55 + hIndex * 1.7) * 0.5 + 0.5
      const threshold = 0.72 - hIndex * 0.1
      if (wave < threshold) {
        completions[completionKey(habit.id, key)] = true
      }
    }
    skips[skipKey(habit.id, monthKey(now))] = hIndex % 3
  })

  return {
    habits,
    categories: DEFAULT_CATEGORIES.map((c) => ({ ...c })),
    completions,
    skips,
    settings: { ...DEFAULT_SETTINGS, name: 'Алексей' },
  }
}

export { todayKey }
