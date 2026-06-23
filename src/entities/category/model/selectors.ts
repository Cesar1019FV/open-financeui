import type { TransactionType } from '@/shared/lib/constants'

import type { Category } from './types'

export function selectCategoryById(categories: Category[]): Map<string, Category> {
  return new Map(categories.map((c) => [c.id, c]))
}

export function selectByCategoryType(categories: Category[], type: TransactionType): Category[] {
  return categories.filter((c) => c.type === type || c.type === 'both')
}

export function selectExpenseCategories(categories: Category[]): Category[] {
  return categories.filter((c) => c.type === 'expense' || c.type === 'both')
}

export function selectIncomeCategories(categories: Category[]): Category[] {
  return categories.filter((c) => c.type === 'income' || c.type === 'both')
}

export function selectCategoriesByKind(categories: Category[], type: TransactionType, kind: string): Category[] {
  return categories.filter((c) => (c.type === type || c.type === 'both') && c.kind === kind)
}