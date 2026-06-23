import { type ReactNode, useState } from 'react'

import { cn } from '@/shared/lib/cn'

interface TabItem {
  value: string
  label: string
  content?: ReactNode
}

interface TabsProps {
  tabs: TabItem[]
  value: string
  onChange: (value: string) => void
}

export function Tabs({ tabs, value, onChange }: TabsProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = tabs.findIndex((t) => t.value === value)
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const next = (currentIndex + 1) % tabs.length
      onChange(tabs[next].value)
      setFocusedIndex(next)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const prev = (currentIndex - 1 + tabs.length) % tabs.length
      onChange(tabs[prev].value)
      setFocusedIndex(prev)
    }
  }

  return (
    <div>
      <div role="tablist" className="flex gap-1 border-b border-line" onKeyDown={handleKeyDown}>
        {tabs.map((tab, i) => {
          const isActive = tab.value === value
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive || i === focusedIndex ? 0 : -1}
              onClick={() => onChange(tab.value)}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                isActive ? 'border-brand-500 text-brand-700' : 'border-transparent text-ink-muted hover:text-ink',
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      {tabs.find((t) => t.value === value)?.content}
    </div>
  )
}