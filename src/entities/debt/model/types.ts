import type { CurrencyCode } from '@/shared/lib/constants'

export interface Debt {
  id: string
  creditor: string
  totalAmount: number
  currency: CurrencyCode
  installmentAmount: number
  installmentsTotal: number
  installmentsPaid: number
  interestRate: number
  startDate: string
  dueDay: number
  notes?: string
}

export type { CurrencyCode }