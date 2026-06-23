import type { CurrencyCode } from '@/shared/lib/constants'

export type LoanStatus = 'pending' | 'partial' | 'settled'

export interface LoanPayment {
  date: string
  amount: number
}

export interface Loan {
  id: string
  debtor: string
  amount: number
  currency: CurrencyCode
  date: string
  paymentsMade: LoanPayment[]
  notes?: string
}

export type { CurrencyCode }