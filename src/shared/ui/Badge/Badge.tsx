import { type ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

type BadgeVariant = 'positive' | 'negative' | 'warning' | 'info' | 'neutral'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  positive: 'bg-brand-100 text-brand-700',
  negative: 'bg-negative/10 text-negative',
  warning: 'bg-warning/15 text-warning',
  info: 'bg-info/10 text-info',
  neutral: 'bg-surface-2 text-ink-muted',
}

export function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}