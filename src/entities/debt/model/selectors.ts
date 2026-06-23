import { addMonths, differenceInDays, format } from 'date-fns'

import { convertAmount } from '@/shared/lib/format'
import type { CurrencyCode } from '@/shared/lib/constants'

import type { Debt } from './types'

export function remainingAmount(debt: Debt): number {
  return Math.max(0, debt.totalAmount - debt.installmentAmount * debt.installmentsPaid)
}

export function remainingInstallments(debt: Debt): number {
  return Math.max(0, debt.installmentsTotal - debt.installmentsPaid)
}

export function debtProgress(debt: Debt): number {
  if (debt.installmentsTotal === 0) return 0
  return Math.min(1, debt.installmentsPaid / debt.installmentsTotal)
}

export function isPaidOff(debt: Debt): boolean {
  return debt.installmentsPaid >= debt.installmentsTotal
}

export function nextDueDate(debt: Debt, today: Date = new Date()): Date {
  const day = Math.min(debt.dueDay, 28)
  const candidate = new Date(today.getFullYear(), today.getMonth(), day)
  if (candidate < today) {
    return addMonths(candidate, 1)
  }
  return candidate
}

export function daysUntilNextDue(debt: Debt, today: Date = new Date()): number {
  return differenceInDays(nextDueDate(debt, today), today)
}

export function totalInterestEstimate(debt: Debt): number {
  return debt.totalAmount * (debt.interestRate / 100) * (debt.installmentsTotal / 12)
}

export function remainingInCurrency(debt: Debt, target: CurrencyCode): number {
  return convertAmount(remainingAmount(debt), debt.currency, target)
}

export function formatNextDue(debt: Debt, today: Date = new Date()): string {
  return format(nextDueDate(debt, today), 'MMM d, yyyy')
}