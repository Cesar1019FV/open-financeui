export type TransactionType = 'income' | 'expense'
export type IncomeKind = 'salary' | 'variable' | 'passive' | 'other'
export type ExpenseKind = 'fixed' | 'variable' | 'occasional'
export type TransactionKind = IncomeKind | ExpenseKind
export type CurrencyCode = 'USD' | 'CRC'
export type RecurrenceInterval = 'weekly' | 'monthly' | 'yearly'

export const INCOME_KINDS: IncomeKind[] = ['salary', 'variable', 'passive', 'other']
export const EXPENSE_KINDS: ExpenseKind[] = ['fixed', 'variable', 'occasional']

export type LoanStatus = 'pending' | 'partial' | 'settled'
export const LOAN_STATUSES: LoanStatus[] = ['pending', 'partial', 'settled']

export type ReminderType = 'payment' | 'due' | 'subscription' | 'savings' | 'custom'
export type ReminderRecurrence = 'one-time' | 'weekly' | 'monthly' | 'yearly'

export type InvestmentType = 'stock' | 'crypto' | 'fund' | 'bond' | 'commodity'
export const INVESTMENT_TYPES: InvestmentType[] = ['stock', 'crypto', 'fund', 'bond', 'commodity']

export interface CategorySeed {
  id: string
  nameKey: string
  type: TransactionType | 'both'
  kind?: TransactionKind
  icon: string
  color: string
}

export const DEFAULT_CATEGORIES: CategorySeed[] = [
  { id: 'cat-salary', nameKey: 'common:categories.salary', type: 'income', kind: 'salary', icon: '💼', color: '#1f7a54' },
  { id: 'cat-freelance', nameKey: 'common:categories.freelance', type: 'income', kind: 'variable', icon: '💻', color: '#2e7cb8' },
  { id: 'cat-bonus', nameKey: 'common:categories.bonus', type: 'income', kind: 'variable', icon: '🎯', color: '#8b5cf6' },
  { id: 'cat-rental', nameKey: 'common:categories.rental', type: 'income', kind: 'passive', icon: '🏠', color: '#c98a1a' },
  { id: 'cat-dividends', nameKey: 'common:categories.dividends', type: 'income', kind: 'passive', icon: '📈', color: '#0891b2' },
  { id: 'cat-sales', nameKey: 'common:categories.sales', type: 'income', kind: 'other', icon: '🏷️', color: '#db2777' },
  { id: 'cat-gift-income', nameKey: 'common:categories.gift', type: 'income', kind: 'other', icon: '🎁', color: '#e11d48' },
  { id: 'cat-other-income', nameKey: 'common:categories.otherIncome', type: 'income', kind: 'other', icon: '💰', color: '#65a30d' },

  { id: 'cat-rent', nameKey: 'common:categories.rent', type: 'expense', kind: 'fixed', icon: '🏠', color: '#1f7a54' },
  { id: 'cat-utilities', nameKey: 'common:categories.utilities', type: 'expense', kind: 'fixed', icon: '💡', color: '#c98a1a' },
  { id: 'cat-water', nameKey: 'common:categories.water', type: 'expense', kind: 'fixed', icon: '🚰', color: '#2e7cb8' },
  { id: 'cat-internet', nameKey: 'common:categories.internet', type: 'expense', kind: 'fixed', icon: '📡', color: '#6366f1' },
  { id: 'cat-subscriptions', nameKey: 'common:categories.subscriptions', type: 'expense', kind: 'fixed', icon: '📺', color: '#8b5cf6' },
  { id: 'cat-phone', nameKey: 'common:categories.phone', type: 'expense', kind: 'fixed', icon: '📱', color: '#db2777' },
  { id: 'cat-insurance', nameKey: 'common:categories.insurance', type: 'expense', kind: 'fixed', icon: '🛡️', color: '#475569' },

  { id: 'cat-groceries', nameKey: 'common:categories.groceries', type: 'expense', kind: 'variable', icon: '🛒', color: '#0891b2' },
  { id: 'cat-transport', nameKey: 'common:categories.transport', type: 'expense', kind: 'variable', icon: '🚗', color: '#ea580c' },
  { id: 'cat-restaurant', nameKey: 'common:categories.restaurant', type: 'expense', kind: 'variable', icon: '🍽️', color: '#e11d48' },
  { id: 'cat-entertainment', nameKey: 'common:categories.entertainment', type: 'expense', kind: 'variable', icon: '🎬', color: '#7c3aed' },
  { id: 'cat-health', nameKey: 'common:categories.health', type: 'expense', kind: 'variable', icon: '💊', color: '#dc2626' },
  { id: 'cat-clothing', nameKey: 'common:categories.clothing', type: 'expense', kind: 'variable', icon: '👕', color: '#9333ea' },

  { id: 'cat-travel', nameKey: 'common:categories.travel', type: 'expense', kind: 'occasional', icon: '✈️', color: '#0284c7' },
  { id: 'cat-repairs', nameKey: 'common:categories.repairs', type: 'expense', kind: 'occasional', icon: '🔧', color: '#a16207' },
  { id: 'cat-emergency', nameKey: 'common:categories.emergency', type: 'expense', kind: 'occasional', icon: '🚨', color: '#b91c1c' },
  { id: 'cat-gifts', nameKey: 'common:categories.gifts', type: 'expense', kind: 'occasional', icon: '🎁', color: '#be185d' },
]

export const CATEGORY_COLOR_PALETTE = [
  '#1f7a54', '#2e7cb8', '#c98a1a', '#8b5cf6', '#0891b2',
  '#db2777', '#e11d48', '#65a30d', '#ea580c', '#7c3aed',
  '#dc2626', '#9333ea', '#0284c7', '#a16207', '#b91c1c',
  '#be185d',
]

export const CATEGORY_ICONS = [
  '💼', '💻', '🎯', '🏠', '📈', '🏷️', '🎁', '💰',
  '💡', '🚰', '📡', '📺', '📱', '🛡️', '🛒', '🚗',
  '🍽️', '🎬', '💊', '👕', '✈️', '🔧', '🚨', '⭐',
]