export function isRequired(value: unknown): boolean {
  return value !== null && value !== undefined && String(value).trim() !== ''
}

export function isPositiveAmount(value: unknown): boolean {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

export function isISODate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value))
}

export function isNonNegativeAmount(value: unknown): boolean {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}