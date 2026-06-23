import { type ReactNode, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { i18n, LOCALE_STORAGE_KEY, type Locale, SUPPORTED_LOCALES } from '@/shared/config'
import { LocaleContext, type LocaleContextValue } from './useLocale'

function getInitialLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (stored === 'es' || stored === 'en') return stored
  } catch {
    /* ignore */
  }
  return (i18n.language?.slice(0, 2) === 'en' ? 'en' : 'es') as Locale
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale)

  const value = useMemo<LocaleContextValue>(() => ({
    locale,
    t,
    locales: SUPPORTED_LOCALES,
    setLocale: (next: Locale) => {
      setLocaleState(next)
      void i18n.changeLanguage(next)
      try {
        localStorage.setItem(LOCALE_STORAGE_KEY, next)
      } catch {
        /* ignore */
      }
      document.documentElement.lang = next
    },
  }), [locale, t])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}