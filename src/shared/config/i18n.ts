import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import commonEs from './locales/es/common'
import navEs from './locales/es/nav'
import dashboardEs from './locales/es/dashboard'
import incomeEs from './locales/es/income'
import expensesEs from './locales/es/expenses'
import balanceEs from './locales/es/balance'
import debtsEs from './locales/es/debts'
import loansEs from './locales/es/loans'
import savingsEs from './locales/es/savings'
import investmentsEs from './locales/es/investments'
import historyEs from './locales/es/history'
import settingsEs from './locales/es/settings'
import validationEs from './locales/es/validation'

import commonEn from './locales/en/common'
import navEn from './locales/en/nav'
import dashboardEn from './locales/en/dashboard'
import incomeEn from './locales/en/income'
import expensesEn from './locales/en/expenses'
import balanceEn from './locales/en/balance'
import debtsEn from './locales/en/debts'
import loansEn from './locales/en/loans'
import savingsEn from './locales/en/savings'
import investmentsEn from './locales/en/investments'
import historyEn from './locales/en/history'
import settingsEn from './locales/en/settings'
import validationEn from './locales/en/validation'

export const LOCALE_STORAGE_KEY = 'finance-locale'
export const SUPPORTED_LOCALES = ['es', 'en'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

function detectInitialLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (stored === 'es' || stored === 'en') return stored
  } catch {
    /* ignore */
  }
  if (typeof navigator !== 'undefined') {
    const lang = navigator.language.slice(0, 2)
    if (lang === 'en') return 'en'
  }
  return 'es'
}

export const ALL_NAMESPACES = [
  'common', 'nav', 'dashboard', 'income', 'expenses', 'balance',
  'debts', 'loans', 'savings', 'investments', 'history', 'settings', 'validation',
] as const

export type Namespace = (typeof ALL_NAMESPACES)[number]

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: {
      es: {
        common: commonEs, nav: navEs, dashboard: dashboardEs, income: incomeEs,
        expenses: expensesEs, balance: balanceEs, debts: debtsEs, loans: loansEs,
        savings: savingsEs, investments: investmentsEs, history: historyEs,
        settings: settingsEs, validation: validationEs,
      },
      en: {
        common: commonEn, nav: navEn, dashboard: dashboardEn, income: incomeEn,
        expenses: expensesEn, balance: balanceEn, debts: debtsEn, loans: loansEn,
        savings: savingsEn, investments: investmentsEn, history: historyEn,
        settings: settingsEn, validation: validationEn,
      },
    },
    lng: detectInitialLocale(),
    fallbackLng: 'es',
    defaultNS: 'common',
    ns: ['common', 'nav'],
    interpolation: { escapeValue: false },
    returnNull: false,
  })
}

export { i18n }


