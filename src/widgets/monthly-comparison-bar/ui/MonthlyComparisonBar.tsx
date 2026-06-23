import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'

import { Card } from '@/shared/ui/Card'
import { useCurrency } from '@/app/providers/useCurrency'
import { useFinanceStore } from '@/shared/api'
import { selectLast6Months } from '@/entities/account-summary'

export function MonthlyComparisonBar() {
  const { t } = useTranslation(['dashboard', 'common'])
  const { currency, format: formatMoney } = useCurrency()
  const transactions = useFinanceStore((s) => s.transactions)
  const points = selectLast6Months({ transactions, debts: [], loans: [], savingsGoals: [], investments: [] }, currency)

  const maxValue = Math.max(...points.map((p) => Math.max(p.income, p.expense)), 1)
  const chartHeight = 200
  const chartWidth = 100
  const barGroupWidth = chartWidth / points.length
  const barWidth = barGroupWidth * 0.32

  return (
    <Card padded className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-ink">{t('sections.monthlyComparison')}</h2>
      <div className="relative">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" className="w-full h-48" role="img" aria-label={t('sections.monthlyComparison')}>
          {[0.25, 0.5, 0.75, 1].map((frac) => (
            <line
              key={frac}
              x1={0}
              x2={chartWidth}
              y1={chartHeight * (1 - frac)}
              y2={chartHeight * (1 - frac)}
              stroke="var(--color-line)"
              strokeWidth={0.3}
              strokeDasharray="1 2"
            />
          ))}
          {points.map((p, i) => {
            const x = i * barGroupWidth + barGroupWidth * 0.18
            const incomeHeight = (p.income / maxValue) * chartHeight
            const expenseHeight = (p.expense / maxValue) * chartHeight
            return (
              <g key={p.yearMonth}>
                <rect
                  x={x}
                  y={chartHeight - incomeHeight}
                  width={barWidth}
                  height={incomeHeight}
                  fill="var(--color-brand-500)"
                  rx={0.5}
                >
                  <title>{`${format(new Date(`${p.yearMonth}-01`), 'MMM yyyy')}: ${formatMoney(p.income, currency)}`}</title>
                </rect>
                <rect
                  x={x + barWidth + 1}
                  y={chartHeight - expenseHeight}
                  width={barWidth}
                  height={expenseHeight}
                  fill="var(--color-negative)"
                  rx={0.5}
                >
                  <title>{`${format(new Date(`${p.yearMonth}-01`), 'MMM yyyy')}: ${formatMoney(p.expense, currency)}`}</title>
                </rect>
              </g>
            )
          })}
        </svg>
      </div>
      <div className="grid grid-cols-6 gap-1 text-xs text-ink-muted text-center">
        {points.map((p) => (
          <span key={p.yearMonth}>{format(new Date(`${p.yearMonth}-01`), 'MMM', { locale: undefined })}</span>
        ))}
      </div>
      <div className="flex items-center gap-4 text-xs text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-brand-500" />
          {t('common:transactionType.income')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-negative" />
          {t('common:transactionType.expense')}
        </span>
      </div>
    </Card>
  )
}