import type { CurrencyCode } from '@/shared/lib/constants'

export type ReminderType = 'payment' | 'due' | 'subscription' | 'savings' | 'custom'
export type ReminderRecurrence = 'one-time' | 'weekly' | 'monthly' | 'yearly'

export interface Reminder {
  id: string
  type: ReminderType
  title: string
  date: string
  amount?: number
  currency?: CurrencyCode
  linkedId?: string
  done: boolean
  recurrence: ReminderRecurrence
}

export type { CurrencyCode }