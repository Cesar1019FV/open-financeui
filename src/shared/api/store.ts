import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { generateId } from '@/shared/lib/id'
import type { Transaction } from '@/entities/transaction'
import type { Category } from '@/entities/category'
import type { Debt } from '@/entities/debt'
import type { Loan, LoanPayment } from '@/entities/loan'
import type { SavingsGoal } from '@/entities/savings-goal'
import type { Investment } from '@/entities/investment'
import type { Budget } from '@/entities/budget'
import type { Reminder } from '@/entities/reminder'
import type { TransactionType, TransactionKind } from '@/shared/lib/constants'

import {
  buildSeedCategories,
  buildSeedTransactions,
  buildSeedDebts,
  buildSeedLoans,
  buildSeedSavingsGoals,
  buildSeedInvestments,
  buildSeedBudgets,
  buildSeedReminders,
} from './seed'

export interface HistoryFilters {
  month: string | null
  type: TransactionType | 'all'
  categoryId: string | 'all'
  kind: TransactionKind | 'all'
  search: string
  page: number
}

function buildSeed(): {
  transactions: Transaction[]
  categories: Category[]
  debts: Debt[]
  loans: Loan[]
  savingsGoals: SavingsGoal[]
  investments: Investment[]
  budgets: Budget[]
  reminders: Reminder[]
} {
  return {
    transactions: buildSeedTransactions(),
    categories: buildSeedCategories(),
    debts: buildSeedDebts(),
    loans: buildSeedLoans(),
    savingsGoals: buildSeedSavingsGoals(),
    investments: buildSeedInvestments(),
    budgets: buildSeedBudgets(),
    reminders: buildSeedReminders(),
  }
}

const initialFilters: HistoryFilters = {
  month: null,
  type: 'all',
  categoryId: 'all',
  kind: 'all',
  search: '',
  page: 1,
}

interface FinanceStore {
  transactions: Transaction[]
  categories: Category[]
  debts: Debt[]
  loans: Loan[]
  savingsGoals: SavingsGoal[]
  investments: Investment[]
  budgets: Budget[]
  reminders: Reminder[]
  historyFilters: HistoryFilters

  addTransaction: (input: Omit<Transaction, 'id' | 'createdAt'>) => void
  updateTransaction: (id: string, patch: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void

  addCategory: (input: Omit<Category, 'id' | 'isDefault'>) => void
  updateCategory: (id: string, patch: Partial<Category>) => void
  deleteCategory: (id: string) => void

  addDebt: (input: Omit<Debt, 'id'>) => void
  updateDebt: (id: string, patch: Partial<Debt>) => void
  deleteDebt: (id: string) => void
  payDebtInstallment: (id: string) => void

  addLoan: (input: Omit<Loan, 'id' | 'paymentsMade'>) => void
  updateLoan: (id: string, patch: Partial<Loan>) => void
  deleteLoan: (id: string) => void
  registerLoanPayment: (id: string, payment: LoanPayment) => void

  addSavingsGoal: (input: Omit<SavingsGoal, 'id'>) => void
  updateSavingsGoal: (id: string, patch: Partial<SavingsGoal>) => void
  deleteSavingsGoal: (id: string) => void
  contributeToGoal: (id: string, amount: number) => void

  addInvestment: (input: Omit<Investment, 'id'>) => void
  updateInvestment: (id: string, patch: Partial<Investment>) => void
  deleteInvestment: (id: string) => void
  updateInvestmentValue: (id: string, currentPrice: number) => void

  setBudget: (input: Omit<Budget, 'id'>) => void
  updateBudget: (id: string, patch: Partial<Budget>) => void
  deleteBudget: (id: string) => void

  addReminder: (input: Omit<Reminder, 'id'>) => void
  updateReminder: (id: string, patch: Partial<Reminder>) => void
  deleteReminder: (id: string) => void
  markReminderDone: (id: string) => void

  setHistoryFilters: (patch: Partial<HistoryFilters>) => void
  resetHistoryFilters: () => void

  resetToSeed: () => void
  clearAll: () => void
}

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set) => ({
      ...buildSeed(),
      historyFilters: { ...initialFilters },

      addTransaction: (input) =>
        set((state) => ({
          transactions: [{ ...input, id: generateId(), createdAt: new Date().toISOString() }, ...state.transactions],
        })),
      updateTransaction: (id, patch) =>
        set((state) => ({
          transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      addCategory: (input) =>
        set((state) => ({
          categories: [...state.categories, { ...input, id: generateId(), isDefault: false }],
        })),
      updateCategory: (id, patch) =>
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),

      addDebt: (input) =>
        set((state) => ({
          debts: [...state.debts, { ...input, id: generateId() }],
        })),
      updateDebt: (id, patch) =>
        set((state) => ({
          debts: state.debts.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        })),
      deleteDebt: (id) =>
        set((state) => ({
          debts: state.debts.filter((d) => d.id !== id),
        })),
      payDebtInstallment: (id) =>
        set((state) => ({
          debts: state.debts.map((d) =>
            d.id === id ? { ...d, installmentsPaid: d.installmentsPaid + 1 } : d,
          ),
        })),

      addLoan: (input) =>
        set((state) => ({
          loans: [...state.loans, { ...input, id: generateId(), paymentsMade: [] }],
        })),
      updateLoan: (id, patch) =>
        set((state) => ({
          loans: state.loans.map((l) => (l.id === id ? { ...l, ...patch } : l)),
        })),
      deleteLoan: (id) =>
        set((state) => ({
          loans: state.loans.filter((l) => l.id !== id),
        })),
      registerLoanPayment: (id, payment) =>
        set((state) => ({
          loans: state.loans.map((l) =>
            l.id === id ? { ...l, paymentsMade: [...l.paymentsMade, payment] } : l,
          ),
        })),

      addSavingsGoal: (input) =>
        set((state) => ({
          savingsGoals: [...state.savingsGoals, { ...input, id: generateId() }],
        })),
      updateSavingsGoal: (id, patch) =>
        set((state) => ({
          savingsGoals: state.savingsGoals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        })),
      deleteSavingsGoal: (id) =>
        set((state) => ({
          savingsGoals: state.savingsGoals.filter((g) => g.id !== id),
        })),
      contributeToGoal: (id, amount) =>
        set((state) => ({
          savingsGoals: state.savingsGoals.map((g) =>
            g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g,
          ),
        })),

      addInvestment: (input) =>
        set((state) => ({
          investments: [...state.investments, { ...input, id: generateId() }],
        })),
      updateInvestment: (id, patch) =>
        set((state) => ({
          investments: state.investments.map((inv) => (inv.id === id ? { ...inv, ...patch } : inv)),
        })),
      deleteInvestment: (id) =>
        set((state) => ({
          investments: state.investments.filter((inv) => inv.id !== id),
        })),
      updateInvestmentValue: (id, currentPrice) =>
        set((state) => ({
          investments: state.investments.map((inv) =>
            inv.id === id ? { ...inv, currentPrice, history: [...inv.history.slice(1), currentPrice] } : inv,
          ),
        })),

      setBudget: (input) =>
        set((state) => {
          const existing = state.budgets.find((b) => b.categoryId === input.categoryId)
          if (existing) {
            return {
              budgets: state.budgets.map((b) =>
                b.categoryId === input.categoryId ? { ...b, ...input, id: existing.id } : b,
              ),
            }
          }
          return { budgets: [...state.budgets, { ...input, id: generateId() }] }
        }),
      updateBudget: (id, patch) =>
        set((state) => ({
          budgets: state.budgets.map((b) => (b.id === id ? { ...b, ...patch } : b)),
        })),
      deleteBudget: (id) =>
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== id),
        })),

      addReminder: (input) =>
        set((state) => ({
          reminders: [...state.reminders, { ...input, id: generateId() }],
        })),
      updateReminder: (id, patch) =>
        set((state) => ({
          reminders: state.reminders.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),
      deleteReminder: (id) =>
        set((state) => ({
          reminders: state.reminders.filter((r) => r.id !== id),
        })),
      markReminderDone: (id) =>
        set((state) => ({
          reminders: state.reminders.map((r) => (r.id === id ? { ...r, done: true } : r)),
        })),

      setHistoryFilters: (patch) =>
        set((state) => ({
          historyFilters: { ...state.historyFilters, ...patch, page: patch.page ?? 1 },
        })),
      resetHistoryFilters: () =>
        set(() => ({ historyFilters: { ...initialFilters } })),

      resetToSeed: () =>
        set(() => ({ ...buildSeed(), historyFilters: { ...initialFilters } })),
      clearAll: () =>
        set(() => ({
          transactions: [],
          categories: buildSeedCategories(),
          debts: [],
          loans: [],
          savingsGoals: [],
          investments: [],
          budgets: [],
          reminders: [],
          historyFilters: { ...initialFilters },
        })),
    }),
    {
      name: 'finance-store:v1',
      version: 1,
      partialize: (state) => ({
        transactions: state.transactions,
        categories: state.categories,
        debts: state.debts,
        loans: state.loans,
        savingsGoals: state.savingsGoals,
        investments: state.investments,
        budgets: state.budgets,
        reminders: state.reminders,
      }),
    },
  ),
)