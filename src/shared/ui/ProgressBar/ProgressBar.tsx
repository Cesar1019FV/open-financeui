import { cn } from '@/shared/lib/cn'

type ProgressBarVariant = 'default' | 'success' | 'warning' | 'danger'

interface ProgressBarProps {
  value: number
  max?: number
  variant?: ProgressBarVariant
  className?: string
}

const variants: Record<ProgressBarVariant, string> = {
  default: 'bg-brand-500',
  success: 'bg-positive',
  warning: 'bg-warning',
  danger: 'bg-negative',
}

function resolveVariant(value: number, max: number, variant: ProgressBarVariant): ProgressBarVariant {
  if (variant !== 'default') return variant
  const pct = max === 0 ? 0 : value / max
  if (pct >= 1) return 'danger'
  if (pct >= 0.8) return 'warning'
  return 'success'
}

export function ProgressBar({ value, max = 100, variant = 'default', className }: ProgressBarProps) {
  const pct = Math.min(100, max === 0 ? 0 : (value / max) * 100)
  const resolved = resolveVariant(value, max, variant)

  return (
    <div className={cn('h-2 w-full rounded-full bg-surface-2 overflow-hidden', className)} role="progressbar" aria-valuenow={value} aria-valuemax={max}>
      <div
        className={cn('h-full rounded-full transition-all duration-300', variants[resolved])}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}