import { type ReactNode, useEffect, useMemo, useState } from 'react'

import { type ThemeMode, resolveTheme, applyTheme, THEME_STORAGE_KEY } from '@/shared/config'
import { ThemeContext, type ThemeContextValue } from './useTheme'

function getInitialMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  } catch {
    /* ignore */
  }
  return 'system'
}

function readPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(getInitialMode)
  const [prefersDark, setPrefersDark] = useState<boolean>(readPrefersDark)

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => setPrefersDark(mql.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  const resolved = resolveTheme(mode, prefersDark)

  useEffect(() => {
    applyTheme(resolved)
  }, [resolved])

  const value = useMemo<ThemeContextValue>(() => ({
    mode,
    resolved,
    setMode: (next: ThemeMode) => {
      setModeState(next)
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next)
      } catch {
        /* ignore */
      }
    },
  }), [mode, resolved])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}