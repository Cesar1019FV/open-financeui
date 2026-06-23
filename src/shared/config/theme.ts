export type ThemeMode = 'light' | 'dark' | 'system'

export const THEME_STORAGE_KEY = 'finance-theme'

export function resolveTheme(mode: ThemeMode, prefersDark: boolean): 'light' | 'dark' {
  if (mode === 'system') return prefersDark ? 'dark' : 'light'
  return mode
}

export function applyTheme(resolved: 'light' | 'dark'): void {
  if (resolved === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}