import { type InputHTMLAttributes, useId } from 'react'

import { cn } from '@/shared/lib/cn'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  label: string
}

export function Checkbox({ label, checked, className, ...props }: CheckboxProps) {
  const id = useId()

  return (
    <label htmlFor={id} className="inline-flex items-center gap-2 cursor-pointer select-none">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        className={cn(
          'h-4 w-4 rounded border-line text-brand-500 cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
          className,
        )}
        {...props}
      />
      <span className="text-sm text-ink">{label}</span>
    </label>
  )
}