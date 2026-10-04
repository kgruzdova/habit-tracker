import { createContext, useContext } from 'react'
import type { AppData, Category, Habit, Settings } from '../types'

export interface AppContextValue {
  data: AppData
  isDone: (habitId: string, date: string) => boolean
  toggleCompletion: (habitId: string, date: string) => void
  setCompletion: (habitId: string, date: string, value: boolean) => void
  consumeSkip: (habit: Habit, date: string) => void
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => Habit
  updateHabit: (id: string, patch: Partial<Habit>) => void
  removeHabit: (id: string) => void
  toggleArchive: (id: string) => void
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => Category
  updateCategory: (id: string, patch: Partial<Category>) => void
  removeCategory: (id: string) => void
  updateSettings: (patch: Partial<Settings>) => void
  exportAll: () => string
  eraseAll: () => void
  loadDemo: () => void
}

export const AppContext = createContext<AppContextValue | null>(null)

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp должен использоваться внутри AppProvider')
  return ctx
}
