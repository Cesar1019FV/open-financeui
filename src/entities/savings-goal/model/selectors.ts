import { differenceInMonths } from 'date-fns'

import { convertAmount } from '@/shared/lib/format'
import type { CurrencyCode } from '@/shared/lib/constants'

import type { SavingsGoal } from './types'

export function goalProgress(goal: SavingsGoal): number {
  if (goal.targetAmount === 0) return 0
  return Math.min(1, goal.currentAmount / goal.targetAmount)
}

export function isGoalComplete(goal: SavingsGoal): boolean {
  return goal.currentAmount >= goal.targetAmount
}

export function monthsRemaining(goal: SavingsGoal, today: Date = new Date()): number {
  if (!goal.targetDate) return Infinity
  return Math.max(0, differenceInMonths(new Date(goal.targetDate), today))
}

export function suggestedMonthly(goal: SavingsGoal, today: Date = new Date()): number {
  const remaining = goal.targetAmount - goal.currentAmount
  if (remaining <= 0) return 0
  const months = monthsRemaining(goal, today)
  if (!Number.isFinite(months) || months <= 0) return goal.monthlyContribution
  return Math.ceil(remaining / months)
}

export function goalCurrentInCurrency(goal: SavingsGoal, target: CurrencyCode): number {
  return convertAmount(goal.currentAmount, goal.currency, target)
}

export function goalTargetInCurrency(goal: SavingsGoal, target: CurrencyCode): number {
  return convertAmount(goal.targetAmount, goal.currency, target)
}