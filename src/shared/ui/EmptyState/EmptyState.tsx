import { type ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-12 px-4', className)}>
      {icon && <div className="mb-3 text-ink-muted">{icon}</div>}
      <h3 className="text-base font-medium text-ink">{title}</h3>
      {description && <p className="mt-1 text-sm text-ink-muted max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}