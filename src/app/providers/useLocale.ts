import { createContext, useContext } from 'react'
import { type TFunction } from 'i18next'

import { type Locale } from '@/shared/config'

export interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: TFunction
  locales: readonly Locale[]
}

export const LocaleContext = createContext<LocaleContextValue | null>(null)

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}