import { type SelectHTMLAttributes, useId } from 'react'

import { cn } from '@/shared/lib/cn'
import { Icon } from '@/shared/ui/Icon'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  label?: string
  error?: string
  options: SelectOption[]
}

export function Select({ label, error, options, className, ...props }: SelectProps) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          className={cn(
            'w-full appearance-none rounded-lg border bg-canvas px-3 py-2 pr-9 text-sm text-ink outline-none transition-colors cursor-pointer',
            'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
            error ? 'border-negative' : 'border-line',
            className,
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <Icon name="chevron-down" size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
      </div>
      {error && <p id={errorId} className="text-xs text-negative">{error}</p>}
    </div>
  )
}