import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Card } from '@/shared/ui/Card'
import { useCurrency } from '@/app/providers/useCurrency'
import { useFinanceStore } from '@/shared/api'
import { selectCategoryBreakdown } from '@/entities/account-summary'
import { formatYearMonth } from '@/entities/transaction'
import { selectCategoryById } from '@/entities/category'

export function CategoryBreakdownPie() {
  const { t } = useTranslation(['dashboard', 'common'])
  const { currency, format: formatMoney } = useCurrency()
  const transactions = useFinanceStore((s) => s.transactions)
  const categories = useFinanceStore((s) => s.categories)
  const [hovered, setHovered] = useState<string | null>(null)

  const yearMonth = formatYearMonth(new Date())
  const breakdown = selectCategoryBreakdown({ transactions, debts: [], loans: [], savingsGoals: [], investments: [] }, yearMonth, currency)
  const categoryMap = selectCategoryById(categories)

  const total = breakdown.reduce((sum, b) => sum + b.amount, 0)
  const cx = 60
  const cy = 60
  const r = 50
  const innerR = 28

  const top = breakdown.slice(0, 6)
  const slices = top.map((b, i) => {
    const previousAngles = top.slice(0, i).reduce((sum, x) => sum + (x.amount / total) * 360, 0)
    const startAngle = -90 + previousAngles
    const angle = (b.amount / total) * 360
    const endAngle = startAngle + angle

    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180

    const x1 = cx + r * Math.cos(startRad)
    const y1 = cy + r * Math.sin(startRad)
    const x2 = cx + r * Math.cos(endRad)
    const y2 = cy + r * Math.sin(endRad)
    const xi1 = cx + innerR * Math.cos(startRad)
    const yi1 = cy + innerR * Math.sin(startRad)
    const xi2 = cx + innerR * Math.cos(endRad)
    const yi2 = cy + innerR * Math.sin(endRad)

    const largeArc = angle > 180 ? 1 : 0

    const d = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${innerR} ${innerR} 0 ${largeArc} 0 ${xi1} ${yi1} Z`

    return { d, category: categoryMap.get(b.categoryId), amount: b.amount, percent: b.amount / total, id: b.categoryId }
  })

  if (total === 0) {
    return (
      <Card padded className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-ink">{t('sections.categoryBreakdown')}</h2>
        <p className="text-sm text-ink-muted py-12 text-center">{t('common:noResults')}</p>
      </Card>
    )
  }

  return (
    <Card padded className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-ink">{t('sections.categoryBreakdown')}</h2>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="shrink-0">
          <svg viewBox="0 0 120 120" className="w-36 h-36" role="img" aria-label={t('sections.categoryBreakdown')}>
            {slices.map((s) => (
              <path
                key={s.id}
                d={s.d}
                fill={s.category?.color ?? 'var(--color-brand-500)'}
                stroke="var(--color-surface)"
                strokeWidth={1}
                opacity={hovered === null || hovered === s.id ? 1 : 0.4}
                onMouseEnter={() => setHovered(s.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <title>{`${s.category ? t(s.category.nameKey) : ''}: ${formatMoney(s.amount, currency)}`}</title>
              </path>
            ))}
          </svg>
        </div>
        <ul className="flex-1 flex flex-col gap-1.5 w-full">
          {slices.map((s) => (
            <li
              key={s.id}
              className="flex items-center gap-2 text-sm cursor-pointer transition-opacity"
              style={{ opacity: hovered === null || hovered === s.id ? 1 : 0.5 }}
              onMouseEnter={() => setHovered(s.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: s.category?.color ?? 'var(--color-brand-500)' }} />
              <span className="flex-1 truncate text-ink-muted">{s.category ? t(s.category.nameKey) : '—'}</span>
              <span className="font-mono text-xs tabular text-ink">{Math.round(s.percent * 100)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}