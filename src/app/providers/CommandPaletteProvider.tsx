import { type ReactNode, useEffect, useState } from 'react'

import { Modal } from '@/shared/ui/Modal'
import { Icon } from '@/shared/ui/Icon'
import { CommandPaletteContext, type CommandPaletteContextValue, type CommandAction } from './useCommandPalette'

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [actions, setActions] = useState<CommandAction[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  const filtered = query
    ? actions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()))
    : actions

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const run = (action: CommandAction) => {
    action.run()
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && filtered[activeIndex]) {
      e.preventDefault()
      run(filtered[activeIndex])
    }
  }

  const value: CommandPaletteContextValue = {
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    register: (next) => setActions((curr) => [...curr.filter((c) => !next.some((n) => n.id === c.id)), ...next]),
  }

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <Modal open={isOpen} onClose={() => setIsOpen(false)} size="md">
        <div role="dialog" aria-label="Quick actions" onKeyDown={handleKeyDown}>
          <div className="flex items-center gap-2 px-3 py-2 border-b border-line">
            <Icon name="search" size={18} className="text-ink-muted" />
            <input
              key={isOpen ? 'open' : 'closed'}
              autoFocus
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActiveIndex(0)
              }}
              placeholder="Buscar acciones..."
              className="w-full bg-transparent text-sm text-ink placeholder:text-ink-muted outline-none"
            />
          </div>
          <ul role="listbox" className="max-h-72 overflow-y-auto py-2">
            {filtered.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-ink-muted">Sin acciones</li>
            ) : (
              filtered.map((action, i) => (
                <li key={action.id} role="option" aria-selected={i === activeIndex}>
                  <button
                    type="button"
                    onClick={() => run(action)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left transition-colors ${
                      i === activeIndex ? 'bg-surface-2 text-ink' : 'text-ink hover:bg-surface-2'
                    }`}
                  >
                    <span>{action.label}</span>
                    {action.hint && <span className="text-xs text-ink-muted">{action.hint}</span>}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </Modal>
    </CommandPaletteContext.Provider>
  )
}