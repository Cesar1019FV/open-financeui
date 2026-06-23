import { useTranslation } from 'react-i18next'

import { Card } from '@/shared/ui/Card'
import { useCurrency } from '@/app/providers/useCurrency'
import { useFinanceStore } from '@/shared/api'
import { selectByMonth, selectByType, selectByKind, selectTotalsByType, formatYearMonth } from '@/entities/transaction'
import type { ExpenseKind } from '@/entities/transaction'

const EXPENSE_KINDS: ExpenseKind[] = ['fixed', 'variable', 'occasional']

export function ExpenseSummaryCards() {
  const { t } = useTranslation(['expenses', 'common'])
  const { currency, format: formatMoney } = useCurrency()
  const transactions = useFinanceStore((s) => s.transactions)

  const yearMonth = formatYearMonth(new Date())
  const monthTx = selectByMonth(transactions, yearMonth)
  const expenseTx = selectByType(monthTx, 'expense')
  const totals = selectTotalsByType(expenseTx, currency)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {EXPENSE_KINDS.map((kind) => {
        const kindTx = selectByKind(expenseTx, kind)
        const kindTotal = selectTotalsByType(kindTx, currency)
        return (
          <Card key={kind} padded className="flex flex-col gap-2">
            <span className="text-sm text-ink-muted">{t(`summary.${kind}`)}</span>
            <span className="font-mono text-xl font-semibold tabular text-negative">{formatMoney(kindTotal.expense, currency)}</span>
            <span className="text-xs text-ink-muted">{kindTx.length} {t('common:units.total').toLowerCase()}</span>
          </Card>
        )
      })}
      <Card padded className="flex flex-col gap-2 bg-negative/5 border-negative/20">
        <span className="text-sm text-ink-muted">{t('common:transactionType.expense')}</span>
        <span className="font-mono text-xl font-semibold tabular text-negative">{formatMoney(totals.expense, currency)}</span>
      </Card>
    </div>
  )
}