import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AppData, Category, Habit, Settings } from '../types'
import {
  completionKey,
  emptyData,
  exportData,
  loadData,
  saveData,
  seedData,
  skipKey,
} from '../lib/storage'
import { todayKey } from '../lib/dates'
import { AppContext } from './context'
import type { AppContextValue } from './context'

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => {
    const loaded = loadData()
    if (loaded.habits.length === 0 && Object.keys(loaded.completions).length === 0) {
      const seeded = seedData()
      saveData(seeded)
      return seeded
    }
    return loaded
  })

  useEffect(() => {
    saveData(data)
  }, [data])

  useEffect(() => {
    document.documentElement.dataset.theme = data.settings.theme
    document.documentElement.style.colorScheme = data.settings.theme
  }, [data.settings.theme])

  const isDone = useCallback(
    (habitId: string, date: string) => Boolean(data.completions[completionKey(habitId, date)]),
    [data.completions],
  )

  const setCompletion = useCallback((habitId: string, date: string, value: boolean) => {
    setData((prev) => {
      const key = completionKey(habitId, date)
      const completions = { ...prev.completions }
      if (value) completions[key] = true
      else delete completions[key]
      return { ...prev, completions }
    })
  }, [])

  const toggleCompletion = useCallback((habitId: string, date: string) => {
    setData((prev) => {
      const key = completionKey(habitId, date)
      const completions = { ...prev.completions }
      if (completions[key]) delete completions[key]
      else completions[key] = true
      return { ...prev, completions }
    })
  }, [])

  /** Явный пропуск: снимает отметку и тратит один из разрешённых пропусков. */
  const consumeSkip = useCallback((habit: Habit, date: string) => {
    setData((prev) => {
      const completions = { ...prev.completions }
      delete completions[completionKey(habit.id, date)]
      const sk = skipKey(habit.id, date)
      const skips = { ...prev.skips }
      skips[sk] = (skips[sk] ?? 0) + 1
      return { ...prev, completions, skips }
    })
  }, [])

  const addHabit = useCallback((habit: Omit<Habit, 'id' | 'createdAt'>) => {
    const created: Habit = { ...habit, id: uid('h'), createdAt: todayKey() }
    setData((prev) => ({ ...prev, habits: [created, ...prev.habits] }))
    return created
  }, [])

  const updateHabit = useCallback((id: string, patch: Partial<Habit>) => {
    setData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)),
    }))
  }, [])

  const removeHabit = useCallback((id: string) => {
    setData((prev) => {
      const completions = { ...prev.completions }
      const skips = { ...prev.skips }
      for (const key of Object.keys(completions)) {
        if (key.startsWith(`${id}|`)) delete completions[key]
      }
      for (const key of Object.keys(skips)) {
        if (key.startsWith(`${id}|`)) delete skips[key]
      }
      return { ...prev, habits: prev.habits.filter((h) => h.id !== id), completions, skips }
    })
  }, [])

  const toggleArchive = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => (h.id === id ? { ...h, archived: !h.archived } : h)),
    }))
  }, [])

  const addCategory = useCallback((category: Omit<Category, 'id' | 'createdAt'>) => {
    const created: Category = { ...category, id: uid('cat'), createdAt: todayKey() }
    setData((prev) => ({ ...prev, categories: [...prev.categories, created] }))
    return created
  }, [])

  const updateCategory = useCallback((id: string, patch: Partial<Category>) => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }))
  }, [])

  const removeCategory = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== id),
      habits: prev.habits.map((h) => (h.categoryId === id ? { ...h, categoryId: null } : h)),
    }))
  }, [])

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setData((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }))
  }, [])

  const exportAll = useCallback(() => exportData(data), [data])

  const eraseAll = useCallback(() => {
    const fresh = emptyData()
    window.localStorage.setItem('habit-tracker:v1', JSON.stringify(fresh))
    setData(fresh)
  }, [])

  const loadDemo = useCallback(() => {
    setData(seedData())
  }, [])

  const value = useMemo<AppContextValue>(
    () => ({
      data,
      isDone,
      toggleCompletion,
      setCompletion,
      consumeSkip,
      addHabit,
      updateHabit,
      removeHabit,
      toggleArchive,
      addCategory,
      updateCategory,
      removeCategory,
      updateSettings,
      exportAll,
      eraseAll,
      loadDemo,
    }),
    [
      data,
      isDone,
      toggleCompletion,
      setCompletion,
      consumeSkip,
      addHabit,
      updateHabit,
      removeHabit,
      toggleArchive,
      addCategory,
      updateCategory,
      removeCategory,
      updateSettings,
      exportAll,
      eraseAll,
      loadDemo,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
