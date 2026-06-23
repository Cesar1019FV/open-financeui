import { type InputHTMLAttributes, useId } from 'react'

import { cn } from '@/shared/lib/cn'
import { CURRENCIES, type CurrencyCode } from '@/shared/lib/format'

interface CurrencyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  label?: string
  currency: CurrencyCode
  error?: string
}

export function CurrencyInput({ label, currency, error, className, onChange, value, ...props }: CurrencyInputProps) {
  const id = useId()
  const errorId = `${id}-error`
  const meta = CURRENCIES[currency]

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
        <span className="text-ink-muted font-mono text-sm shrink-0">{meta.symbol}</span>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          className={cn(
            'w-full bg-transparent font-mono text-sm text-ink placeholder:text-ink-muted outline-none',
            className,
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          value={value}
          onChange={onChange}
          {...props}
        />
      </div>
      {error && <p id={errorId} className="text-xs text-negative">{error}</p>}
    </div>
  )
}