import { type ReactNode, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/shared/lib/cn'
import { Icon } from '@/shared/ui/Icon'

type DrawerSide = 'left' | 'right'

interface DrawerProps {
  open: boolean
  onClose: () => void
  side?: DrawerSide
  width?: string
  title?: string
  children: ReactNode
}

export function Drawer({ open, onClose, side = 'right', width = 'w-80', title, children }: DrawerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex animate-fade-in" onClick={onClose} role="presentation">
      <div className="absolute inset-0 bg-ink/40" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
        className={cn(
          'relative bg-surface border-line shadow-pop flex flex-col h-full animate-slide-up',
          width,
          side === 'left' && 'border-r' ,
          side === 'right' && 'border-l ml-auto',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-line">
            <h2 id="drawer-title" className="text-lg font-semibold text-ink">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="text-ink-muted hover:text-ink p-1 rounded-md hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <Icon name="close" size={20} />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>,
    document.body,
  )
}