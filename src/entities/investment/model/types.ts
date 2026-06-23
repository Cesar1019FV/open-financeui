import type { CurrencyCode, InvestmentType } from '@/shared/lib/constants'

export interface Investment {
  id: string
  name: string
  type: InvestmentType
  ticker?: string
  units: number
  purchasePrice: number
  currentPrice: number
  purchaseDate: string
  currency: CurrencyCode
  history: number[]
}

export type { CurrencyCode, InvestmentType }