import { type ElementType, type ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

interface CardProps {
  as?: ElementType
  padded?: boolean
  hoverable?: boolean
  className?: string
  children: ReactNode
}

export function Card({ as: Component = 'div', padded = false, hoverable = false, className, children }: CardProps) {
  return (
    <Component
      className={cn(
        'bg-surface border border-line rounded-2xl shadow-card',
        hoverable && 'transition-shadow hover:shadow-pop',
        padded && 'p-5',
        className,
      )}
    >
      {children}
    </Component>
  )
}