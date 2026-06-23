import { type ButtonHTMLAttributes } from 'react'

import { cn } from '@/shared/lib/cn'
import { Icon, type IconName } from '@/shared/ui/Icon'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string
  icon: IconName
  size?: number
}

export function IconButton({ icon, size = 18, className, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center p-2 rounded-md text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    >
      <Icon name={icon} size={size} />
    </button>
  )
}