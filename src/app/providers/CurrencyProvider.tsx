import { type ReactNode, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CURRENCIES, convertAmount, RATE_USD_TO_CRC, type CurrencyCode } from '@/shared/lib/format'
import { CurrencyContext, type CurrencyContextValue } from './useCurrency'

const CURRENCY_STORAGE_KEY = 'finance-currency'

function getInitialCurrency(): CurrencyCode {
  try {
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY)
    if (stored === 'USD' || stored === 'CRC') return stored
  } catch {
    /* ignore */
  }
  return 'USD'
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation()
  const [currency, setCurrencyState] = useState<CurrencyCode>(getInitialCurrency)

  const value = useMemo<CurrencyContextValue>(() => {
    const locale = i18n.language ?? 'es'
    return {
      currency,
      rate: RATE_USD_TO_CRC,
      convert: (amount: number, from: CurrencyCode) => convertAmount(amount, from, currency),
      format: (amount: number, from: CurrencyCode) =>
        new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
          maximumFractionDigits: currency === 'CRC' ? 0 : 2,
        }).format(convertAmount(amount, from, currency)),
      symbol: CURRENCIES[currency].symbol,
      setCurrency: (next: CurrencyCode) => {
        setCurrencyState(next)
        try {
          localStorage.setItem(CURRENCY_STORAGE_KEY, next)
        } catch {
          /* ignore */
        }
      },
    }
  }, [currency, i18n.language])

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}