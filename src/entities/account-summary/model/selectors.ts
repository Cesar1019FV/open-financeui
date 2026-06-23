import { subMonths } from 'date-fns'

import { convertAmount } from '@/shared/lib/format'
import type { CurrencyCode } from '@/shared/lib/constants'
import type { Transaction, TransactionKind } from '@/entities/transaction'
import type { Debt } from '@/entities/debt'
import type { Loan } from '@/entities/loan'
import { loanRemaining } from '@/entities/loan'
import { remainingAmount } from '@/entities/debt'
import type { SavingsGoal } from '@/entities/savings-goal'
import type { Investment } from '@/entities/investment'
import { currentValue } from '@/entities/investment'

export interface MonthlySummary {
  totalIncome: number
  totalExpense: number
  net: number
  byCategory: Map<string, { income: number; expense: number }>
  byKind: Record<TransactionKind, number>
  vsPrevious: { incomeDelta: number; expenseDelta: number; netDelta: number }
}

export interface NetWorth {
  savings: number
  investments: number
  receivable: number
  debts: number
  total: number
}

export interface MonthPoint {
  yearMonth: string
  income: number
  expense: number
  net: number
}

export interface CategoryBreakdown {
  categoryId: string
  amount: number
  percent: number
}

interface StoreSnapshot {
  transactions: Transaction[]
  debts: Debt[]
  loans: Loan[]
  savingsGoals: SavingsGoal[]
  investments: Investment[]
}

export function selectMonthlySummary(
  state: StoreSnapshot,
  yearMonth: string,
  targetCurrency: CurrencyCode,
): MonthlySummary {
  const prevMonthDate = subMonths(new Date(`${yearMonth}-01T00:00:00`), 1)
  const prevYearMonth = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`

  const currentTx = state.transactions.filter((t) => t.date.startsWith(yearMonth))
  const prevTx = state.transactions.filter((t) => t.date.startsWith(prevYearMonth))

  const byCategory = new Map<string, { income: number; expense: number }>()
  const byKind: Record<TransactionKind, number> = {
    salary: 0, variable: 0, passive: 0, other: 0, fixed: 0, occasional: 0,
  }

  let totalIncome = 0
  let totalExpense = 0
  for (const t of currentTx) {
    const converted = convertAmount(t.amount, t.currency, targetCurrency)
    byKind[t.kind] += converted
    const existing = byCategory.get(t.categoryId) ?? { income: 0, expense: 0 }
    if (t.type === 'income') {
      totalIncome += converted
      existing.income += converted
    } else {
      totalExpense += converted
      existing.expense += converted
    }
    byCategory.set(t.categoryId, existing)
  }

  let prevIncome = 0
  let prevExpense = 0
  for (const t of prevTx) {
    const converted = convertAmount(t.amount, t.currency, targetCurrency)
    if (t.type === 'income') prevIncome += converted
    else prevExpense += converted
  }

  return {
    totalIncome,
    totalExpense,
    net: totalIncome - totalExpense,
    byCategory,
    byKind,
    vsPrevious: {
      incomeDelta: totalIncome - prevIncome,
      expenseDelta: totalExpense - prevExpense,
      netDelta: (totalIncome - totalExpense) - (prevIncome - prevExpense),
    },
  }
}

export function selectLast6Months(
  state: StoreSnapshot,
  targetCurrency: CurrencyCode,
  today: Date = new Date(),
): MonthPoint[] {
  const points: MonthPoint[] = []
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(today, i)
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const monthTx = state.transactions.filter((t) => t.date.startsWith(ym))
    let income = 0
    let expense = 0
    for (const t of monthTx) {
      const converted = convertAmount(t.amount, t.currency, targetCurrency)
      if (t.type === 'income') income += converted
      else expense += converted
    }
    points.push({ yearMonth: ym, income, expense, net: income - expense })
  }
  return points
}

export function selectCategoryBreakdown(
  state: StoreSnapshot,
  yearMonth: string,
  targetCurrency: CurrencyCode,
): CategoryBreakdown[] {
  const summary = selectMonthlySummary(state, yearMonth, targetCurrency)
  const totalExpense = summary.totalExpense
  const breakdown: CategoryBreakdown[] = []
  for (const [categoryId, { expense }] of summary.byCategory) {
    if (expense <= 0) continue
    breakdown.push({
      categoryId,
      amount: expense,
      percent: totalExpense === 0 ? 0 : expense / totalExpense,
    })
  }
  return breakdown.sort((a, b) => b.amount - a.amount)
}

export function selectNetWorth(
  state: StoreSnapshot,
  targetCurrency: CurrencyCode,
): NetWorth {
  let savings = 0
  for (const g of state.savingsGoals) {
    savings += convertAmount(g.currentAmount, g.currency, targetCurrency)
  }
  let investments = 0
  for (const inv of state.investments) {
    investments += convertAmount(currentValue(inv), inv.currency, targetCurrency)
  }
  let receivable = 0
  for (const l of state.loans) {
    receivable += convertAmount(loanRemaining(l), l.currency, targetCurrency)
  }
  let debts = 0
  for (const d of state.debts) {
    debts += convertAmount(remainingAmount(d), d.currency, targetCurrency)
  }
  return { savings, investments, receivable, debts, total: savings + investments + receivable - debts }
}