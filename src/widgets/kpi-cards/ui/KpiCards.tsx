import { useTranslation } from 'react-i18next'

import { Stat } from '@/shared/ui/Stat'
import { useCurrency } from '@/app/providers/useCurrency'
import { useFinanceStore } from '@/shared/api'
import { selectMonthlySummary } from '@/entities/account-summary'
import { formatYearMonth } from '@/entities/transaction'

export function KpiCards() {
  const { t } = useTranslation(['dashboard'])
  const { currency, format } = useCurrency()
  const transactions = useFinanceStore((s) => s.transactions)

  const yearMonth = formatYearMonth(new Date())
  const summary = selectMonthlySummary({ transactions, debts: [], loans: [], savingsGoals: [], investments: [] }, yearMonth, currency)
  const estimatedSavings = Math.max(0, summary.net)

  const incomeTrend = summary.vsPrevious.incomeDelta !== 0
    ? { value: format(Math.abs(summary.vsPrevious.incomeDelta), currency), intent: summary.vsPrevious.incomeDelta >= 0 ? 'positive' as const : 'negative' as const }
    : undefined
  const expenseTrend = summary.vsPrevious.expenseDelta !== 0
    ? { value: format(Math.abs(summary.vsPrevious.expenseDelta), currency), intent: summary.vsPrevious.expenseDelta <= 0 ? 'positive' as const : 'negative' as const }
    : undefined

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Stat
        label={t('kpi.totalIncome')}
        value={format(summary.totalIncome, currency)}
        intent="positive"
        icon="income"
        trend={incomeTrend}
      />
      <Stat
        label={t('kpi.totalExpense')}
        value={format(summary.totalExpense, currency)}
        intent="negative"
        icon="expense"
        trend={expenseTrend}
      />
      <Stat
        label={t('kpi.netBalance')}
        value={format(summary.net, currency)}
        intent={summary.net >= 0 ? 'positive' : 'negative'}
        icon="balance"
      />
      <Stat
        label={t('kpi.estimatedSavings')}
        value={format(estimatedSavings, currency)}
        intent="default"
        icon="savings"
      />
    </div>
  )
}