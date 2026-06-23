import type { CurrencyCode } from '@/shared/lib/constants'

export interface Budget {
  id: string
  categoryId: string
  amount: number
  currency: CurrencyCode
  period: 'monthly'
}

export type { CurrencyCode }