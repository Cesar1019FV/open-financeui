import { convertAmount } from '@/shared/lib/format'
import type { CurrencyCode } from '@/shared/lib/constants'

import type { Loan, LoanStatus } from './types'

export function totalPaid(loan: Loan): number {
  return loan.paymentsMade.reduce((sum, p) => sum + p.amount, 0)
}

export function loanRemaining(loan: Loan): number {
  return Math.max(0, loan.amount - totalPaid(loan))
}

export function loanProgress(loan: Loan): number {
  if (loan.amount === 0) return 0
  return Math.min(1, totalPaid(loan) / loan.amount)
}

export function loanStatus(loan: Loan): LoanStatus {
  const remaining = loanRemaining(loan)
  if (remaining <= 0) return 'settled'
  if (totalPaid(loan) > 0) return 'partial'
  return 'pending'
}

export function loanRemainingInCurrency(loan: Loan, target: CurrencyCode): number {
  return convertAmount(loanRemaining(loan), loan.currency, target)
}