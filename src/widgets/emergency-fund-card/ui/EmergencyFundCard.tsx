import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { Card } from '@/shared/ui/Card'
import { ProgressBar } from '@/shared/ui/ProgressBar'
import { useCurrency } from '@/app/providers/useCurrency'
import { useFinanceStore } from '@/shared/api'
import { selectByMonth, selectByType, selectTotalsByType, formatYearMonth } from '@/entities/transaction'
import { goalCurrentInCurrency, goalTargetInCurrency } from '@/entities/savings-goal'

export function EmergencyFundCard() {
  const { t } = useTranslation(['savings', 'common'])
  const { currency, format: formatMoney } = useCurrency()
  const savingsGoals = useFinanceStore((s) => s.savingsGoals)
  const transactions = useFinanceStore((s) => s.transactions)

  const emergencyGoal = savingsGoals.find((g) => g.isEmergencyFund)

  const monthlyExpenses = useMemo(() => {
    const yearMonth = formatYearMonth(new Date())
    const monthTx = selectByMonth(transactions, yearMonth)
    const expenseTx = selectByType(monthTx, 'expense')
    return selectTotalsByType(expenseTx, currency).expense
  }, [transactions, currency])

  const monthsOfExpenses = emergencyGoal && monthlyExpenses > 0
    ? goalCurrentInCurrency(emergencyGoal, currency) / monthlyExpenses
    : 0

  const recommendedMin = monthlyExpenses * 3
  const recommendedMax = monthlyExpenses * 6
  const current = emergencyGoal ? goalCurrentInCurrency(emergencyGoal, currency) : 0
  const target = emergencyGoal ? goalTargetInCurrency(emergencyGoal, currency) : recommendedMax
  const progress = target > 0 ? Math.min(1, current / target) : 0

  return (
    <Card padded className="flex flex-col gap-4 border-brand-500 bg-brand-50">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-brand-700">{t('emergency.title')}</h2>
      </div>
      <p className="text-sm text-ink-muted">{t('emergency.recommended')}</p>

      <div className="flex items-baseline justify-between">
        <span className="text-sm text-ink-muted">{t('common:units.paid')}</span>
        <span className="font-mono text-2xl font-semibold tabular text-brand-700">{formatMoney(current, currency)}</span>
      </div>

      <ProgressBar value={progress * 100} max={100} variant="success" />

      <div className="flex items-center justify-between text-xs text-ink-muted font-mono tabular">
        <span>{formatMoney(0, currency)}</span>
        <span>{formatMoney(target, currency)}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-brand-100">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-ink-muted">{t('emergency.monthsOfExpenses')}</span>
          <span className="font-mono text-lg font-semibold tabular text-ink">{monthsOfExpenses.toFixed(1)}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-ink-muted">3–6 {t('emergency.monthsOfExpenses')}</span>
          <span className="font-mono text-sm tabular text-ink-muted">{formatMoney(recommendedMin, currency)} – {formatMoney(recommendedMax, currency)}</span>
        </div>
      </div>
    </Card>
  )
}