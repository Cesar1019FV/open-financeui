import { useTranslation } from 'react-i18next'

import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { ProgressBar } from '@/shared/ui/ProgressBar'
import { useCurrency } from '@/app/providers/useCurrency'
import { useFinanceStore } from '@/shared/api'
import { selectCategoryById } from '@/entities/category'
import { budgetPercentUsed, budgetAmountInCurrency, budgetSpent } from '@/entities/budget'
import { formatYearMonth } from '@/entities/transaction'

export function BudgetAlertsList() {
  const { t } = useTranslation(['dashboard', 'common'])
  const { currency, format: formatMoney } = useCurrency()
  const budgets = useFinanceStore((s) => s.budgets)
  const transactions = useFinanceStore((s) => s.transactions)
  const categories = useFinanceStore((s) => s.categories)
  const categoryMap = selectCategoryById(categories)

  const yearMonth = formatYearMonth(new Date())

  const alerts = budgets
    .map((b) => {
      const pct = budgetPercentUsed(b, transactions, currency, yearMonth)
      const status = pct >= 1 ? 'over' : pct >= 0.8 ? 'warning' : 'ok'
      return { budget: b, pct, status }
    })
    .filter((a) => a.status !== 'ok')
    .sort((a, b) => b.pct - a.pct)

  return (
    <Card padded className="flex flex-col gap-3">
      <h2 className="text-base font-semibold text-ink">{t('sections.budgetAlerts')}</h2>
      {alerts.length === 0 ? (
        <p className="text-sm text-ink-muted py-6 text-center">{t('common:status.ok')}</p>
      ) : (
        <ul aria-live="polite" className="flex flex-col gap-3">
          {alerts.map(({ budget, pct, status }) => {
            const category = categoryMap.get(budget.categoryId)
            const total = budgetAmountInCurrency(budget, currency)
            const spent = budgetSpent(budget, transactions, currency, yearMonth)
            return (
              <li key={budget.id} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-ink flex items-center gap-1.5">
                    {category && <span>{category.icon}</span>}
                    {category ? t(category.nameKey) : '—'}
                  </span>
                  {status === 'over' ? (
                    <Badge variant="negative">{t('common:status.over')}</Badge>
                  ) : (
                    <Badge variant="warning">{t('common:status.warning')}</Badge>
                  )}
                </div>
                <ProgressBar value={pct * 100} max={100} />
                <div className="flex items-center justify-between text-xs text-ink-muted font-mono tabular">
                  <span>{formatMoney(spent, currency)}</span>
                  <span>{formatMoney(total, currency)}</span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}