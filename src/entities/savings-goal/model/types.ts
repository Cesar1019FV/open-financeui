import type { CurrencyCode } from '@/shared/lib/constants'

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currency: CurrencyCode
  currentAmount: number
  targetDate?: string
  isEmergencyFund: boolean
  monthlyContribution: number
}

export type { CurrencyCode }