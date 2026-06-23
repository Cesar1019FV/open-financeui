import { type ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'
import { Card } from '@/shared/ui/Card'
import { Icon, type IconName } from '@/shared/ui/Icon'

type StatIntent = 'default' | 'positive' | 'negative' | 'warning'

interface StatProps {
  label: string
  value: ReactNode
  trend?: { value: string; intent: 'positive' | 'negative' }
  intent?: StatIntent
  icon?: IconName
  className?: string
}

const valueColor: Record<StatIntent, string> = {
  default: 'text-ink',
  positive: 'text-positive',
  negative: 'text-negative',
  warning: 'text-warning',
}

export function Stat({ label, value, trend, intent = 'default', icon, className }: StatProps) {
  return (
    <Card padded className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink-muted">{label}</span>
        {icon && <Icon name={icon} size={18} className="text-ink-muted" />}
      </div>
      <div className={cn('font-mono text-2xl font-semibold tabular', valueColor[intent])}>
        {value}
      </div>
      {trend && (
        <div className={cn(
          'inline-flex items-center gap-1 text-xs',
          trend.intent === 'positive' ? 'text-positive' : 'text-negative',
        )}>
          <Icon name={trend.intent === 'positive' ? 'arrow-up' : 'arrow-down'} size={12} />
          {trend.value}
        </div>
      )}
    </Card>
  )
}