import { convertAmount } from '@/shared/lib/format'
import type { CurrencyCode } from '@/shared/lib/constants'

import type { Investment } from './types'

export function amountInvested(inv: Investment): number {
  return inv.units * inv.purchasePrice
}

export function currentValue(inv: Investment): number {
  return inv.units * inv.currentPrice
}

export function returnValue(inv: Investment): number {
  return currentValue(inv) - amountInvested(inv)
}

export function returnPercent(inv: Investment): number {
  const invested = amountInvested(inv)
  if (invested === 0) return 0
  return returnValue(inv) / invested
}

export function isProfitable(inv: Investment): boolean {
  return returnValue(inv) >= 0
}

export function currentValueInCurrency(inv: Investment, target: CurrencyCode): number {
  return convertAmount(currentValue(inv), inv.currency, target)
}

export function investedInCurrency(inv: Investment, target: CurrencyCode): number {
  return convertAmount(amountInvested(inv), inv.currency, target)
}