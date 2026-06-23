import { convertAmount } from '@/shared/lib/format'
import type { CurrencyCode } from '@/shared/lib/constants'
import type { Transaction } from '@/entities/transaction'

import type { Budget } from './types'

export function budgetSpent(budget: Budget, transactions: Transaction[], targetCurrency: CurrencyCode, yearMonth: string): number {
  const monthTx = transactions.filter((t) => t.date.startsWith(yearMonth) && t.categoryId === budget.categoryId && t.type === 'expense')
  let sum = 0
  for (const t of monthTx) {
    sum += convertAmount(t.amount, t.currency, targetCurrency)
  }
  return sum
}

export function budgetAmountInCurrency(budget: Budget, target: CurrencyCode): number {
  return convertAmount(budget.amount, budget.currency, target)
}

export function budgetRemaining(budget: Budget, transactions: Transaction[], targetCurrency: CurrencyCode, yearMonth: string): number {
  return budgetAmountInCurrency(budget, targetCurrency) - budgetSpent(budget, transactions, targetCurrency, yearMonth)
}

export function budgetPercentUsed(budget: Budget, transactions: Transaction[], targetCurrency: CurrencyCode, yearMonth: string): number {
  const total = budgetAmountInCurrency(budget, targetCurrency)
  if (total === 0) return 0
  return budgetSpent(budget, transactions, targetCurrency, yearMonth) / total
}

export function budgetStatus(budget: Budget, transactions: Transaction[], targetCurrency: CurrencyCode, yearMonth: string): 'ok' | 'warning' | 'over' {
  const pct = budgetPercentUsed(budget, transactions, targetCurrency, yearMonth)
  if (pct >= 1) return 'over'
  if (pct >= 0.8) return 'warning'
  return 'ok'
}