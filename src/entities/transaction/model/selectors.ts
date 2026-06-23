import { format, parseISO } from 'date-fns'

import { convertAmount } from '@/shared/lib/format'
import type { CurrencyCode } from '@/shared/lib/constants'

import type { Transaction, TransactionType, TransactionKind } from './types'

export function selectByMonth(transactions: Transaction[], yearMonth: string): Transaction[] {
  return transactions.filter((t) => t.date.startsWith(yearMonth))
}

export function selectByCategory(transactions: Transaction[], categoryId: string): Transaction[] {
  return transactions.filter((t) => t.categoryId === categoryId)
}

export function selectByType(transactions: Transaction[], type: TransactionType): Transaction[] {
  return transactions.filter((t) => t.type === type)
}

export function selectByKind(transactions: Transaction[], kind: TransactionKind): Transaction[] {
  return transactions.filter((t) => t.kind === kind)
}

export function selectRecurring(transactions: Transaction[]): Transaction[] {
  return transactions.filter((t) => t.recurring)
}

export function selectTotalsByType(
  transactions: Transaction[],
  targetCurrency: CurrencyCode,
): { income: number; expense: number } {
  let income = 0
  let expense = 0
  for (const t of transactions) {
    const converted = convertAmount(t.amount, t.currency, targetCurrency)
    if (t.type === 'income') income += converted
    else expense += converted
  }
  return { income, expense }
}

export function selectTotalsByKind(
  transactions: Transaction[],
  targetCurrency: CurrencyCode,
): Record<TransactionKind, number> {
  const totals: Record<TransactionKind, number> = {
    salary: 0, variable: 0, passive: 0, other: 0, fixed: 0, occasional: 0,
  }
  for (const t of transactions) {
    const converted = convertAmount(t.amount, t.currency, targetCurrency)
    totals[t.kind] += converted
  }
  return totals
}

export function selectTotalsByCategory(
  transactions: Transaction[],
  targetCurrency: CurrencyCode,
): Map<string, { income: number; expense: number }> {
  const map = new Map<string, { income: number; expense: number }>()
  for (const t of transactions) {
    const converted = convertAmount(t.amount, t.currency, targetCurrency)
    const existing = map.get(t.categoryId) ?? { income: 0, expense: 0 }
    if (t.type === 'income') existing.income += converted
    else existing.expense += converted
    map.set(t.categoryId, existing)
  }
  return map
}

export function formatYearMonth(date: Date): string {
  return format(date, 'yyyy-MM')
}

export function formatISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function parseTransactionDate(iso: string): Date {
  return parseISO(iso)
}