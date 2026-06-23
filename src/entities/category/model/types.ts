import type { TransactionType, TransactionKind } from '@/shared/lib/constants'

export interface Category {
  id: string
  nameKey: string
  type: TransactionType | 'both'
  kind?: TransactionKind
  icon: string
  color: string
  custom: boolean
  isDefault: boolean
}

export type { TransactionType, TransactionKind }