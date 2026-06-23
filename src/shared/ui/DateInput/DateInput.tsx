import { type InputHTMLAttributes, useId } from 'react'

import { cn } from '@/shared/lib/cn'

interface DateInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  label?: string
  error?: string
  inputType?: 'date' | 'month'
}

export function DateInput({ label, error, inputType = 'date', className, ...props }: DateInputProps) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input
        id={id}
        type={inputType}
        className={cn(
          'w-full rounded-lg border bg-canvas px-3 py-2 text-sm text-ink outline-none transition-colors',
          'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
          error ? 'border-negative' : 'border-line',
          '[color-scheme:light_dark]',
          className,
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && <p id={errorId} className="text-xs text-negative">{error}</p>}
    </div>
  )
}