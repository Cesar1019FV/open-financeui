import { type InputHTMLAttributes, type ReactNode, useId } from 'react'

import { cn } from '@/shared/lib/cn'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'prefix'> {
  label?: string
  error?: string
  hint?: string
  prefix?: ReactNode
  suffix?: ReactNode
}

export function Input({ label, error, hint, prefix, suffix, className, ...props }: InputProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg border bg-canvas px-3 py-2 transition-colors',
          'focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20',
          error ? 'border-negative' : 'border-line',
        )}
      >
        {prefix && <span className="text-ink-muted text-sm shrink-0">{prefix}</span>}
        <input
          id={id}
          className={cn('w-full bg-transparent text-sm text-ink placeholder:text-ink-muted outline-none', className)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          {...props}
        />
        {suffix && <span className="text-ink-muted text-sm shrink-0">{suffix}</span>}
      </div>
      {error && <p id={errorId} className="text-xs text-negative">{error}</p>}
      {hint && !error && <p id={hintId} className="text-xs text-ink-muted">{hint}</p>}
    </div>
  )
}