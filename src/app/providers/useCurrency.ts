import { createContext, useContext } from 'react'

import { type CurrencyCode } from '@/shared/lib/format'

export interface CurrencyContextValue {
  currency: CurrencyCode
  setCurrency: (currency: CurrencyCode) => void
  rate: number
  convert: (amount: number, from: CurrencyCode) => number
  format: (amount: number, from: CurrencyCode) => string
  symbol: string
}

export const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider')
  return ctx
}