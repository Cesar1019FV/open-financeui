import { differenceInDays, parseISO } from 'date-fns'

import type { Reminder } from './types'

export function isOverdue(reminder: Reminder, today: Date = new Date()): boolean {
  if (reminder.done) return false
  return differenceInDays(parseISO(reminder.date), today) < 0
}

export function daysUntil(reminder: Reminder, today: Date = new Date()): number {
  return differenceInDays(parseISO(reminder.date), today)
}

export function isUpcoming(reminder: Reminder, today: Date = new Date(), withinDays = 7): boolean {
  if (reminder.done) return false
  const days = daysUntil(reminder, today)
  return days >= 0 && days <= withinDays
}