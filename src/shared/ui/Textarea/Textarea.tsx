import { type TextareaHTMLAttributes, useId } from 'react'

import { cn } from '@/shared/lib/cn'

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          'min-h-24 resize-y rounded-lg border bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-muted outline-none transition-colors',
          'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
          error ? 'border-negative' : 'border-line',
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