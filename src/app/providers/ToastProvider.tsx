import { type ReactNode, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/shared/lib/cn'
import { Icon, type IconName } from '@/shared/ui/Icon'
import { ToastContext, type ToastContextValue, type ToastVariant } from './useToast'

interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
}

const variantIcon: Record<ToastVariant, IconName> = {
  success: 'check',
  error: 'alert',
  info: 'alert',
  warning: 'alert',
}

const variantClass: Record<ToastVariant, string> = {
  success: 'text-positive',
  error: 'text-negative',
  info: 'text-info',
  warning: 'text-warning',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const remove = useCallback((id: string) => {
    setToasts((curr) => curr.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((message: string, variant: ToastVariant = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    setToasts((curr) => [...curr.slice(-2), { id, message, variant }])
    window.setTimeout(() => remove(id), 4000)
  }, [remove])

  const value: ToastContextValue = { toast }

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div
          aria-live="polite"
          role="status"
          className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
        >
          {toasts.map((t) => (
            <div
              key={t.id}
              className={cn(
                'flex items-center gap-2 rounded-lg bg-surface border border-line px-4 py-3 shadow-pop animate-slide-up pointer-events-auto',
              )}
            >
              <Icon name={variantIcon[t.variant]} size={18} className={variantClass[t.variant]} />
              <span className="text-sm text-ink">{t.message}</span>
              <button
                type="button"
                onClick={() => remove(t.id)}
                aria-label="Close"
                className="ml-2 text-ink-muted hover:text-ink"
              >
                <Icon name="close" size={14} />
              </button>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}