import type { TransactionType, TransactionKind, CurrencyCode, RecurrenceInterval } from '@/shared/lib/constants'

export interface Transaction {
  id: string
  type: TransactionType
  kind: TransactionKind
  categoryId: string
  amount: number
  currency: CurrencyCode
  date: string
  description: string
  recurring: boolean
  recurringInterval?: RecurrenceInterval
  createdAt: string
}

export type { TransactionType, TransactionKind, CurrencyCode, RecurrenceInterval }
export type { IncomeKind, ExpenseKind } from '@/shared/lib/constants'