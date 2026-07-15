export const RATE_USD_TO_CRC = 520

export type CurrencyCode = 'USD' | 'CRC'

export interface CurrencyMeta {
  code: CurrencyCode
  symbol: string
  locale: string
}

export const CURRENCIES: Record<CurrencyCode, CurrencyMeta> = {
  USD: { code: 'USD', symbol: '$', locale: 'en-US' },
  CRC: { code: 'CRC', symbol: '₡', locale: 'es-CR' },
}

export const CURRENCY_LIST: CurrencyMeta[] = [CURRENCIES.USD, CURRENCIES.CRC]

export function convertAmount(amount: number, from: CurrencyCode, to: CurrencyCode): number {
  if (from === to) return amount
  if (from === 'USD' && to === 'CRC') return amount * RATE_USD_TO_CRC
  if (from === 'CRC' && to === 'USD') return amount / RATE_USD_TO_CRC
  return amount
}

export function formatCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  locale: string,
): string {
  const converted = convertAmount(amount, from, to)
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: to,
    maximumFractionDigits: to === 'CRC' ? 0 : 2,
  }).format(converted)
}

export function formatPercent(value: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatCompact(value: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}