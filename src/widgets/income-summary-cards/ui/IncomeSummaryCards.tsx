import { useTranslation } from 'react-i18next'

import { Card } from '@/shared/ui/Card'
import { useCurrency } from '@/app/providers/useCurrency'
import { useFinanceStore } from '@/shared/api'
import { selectByMonth, selectByType, selectByKind, selectTotalsByType, formatYearMonth } from '@/entities/transaction'
import type { IncomeKind } from '@/entities/transaction'

const INCOME_KINDS: IncomeKind[] = ['salary', 'variable', 'passive', 'other']

export function IncomeSummaryCards() {
  const { t } = useTranslation(['income', 'common'])
  const { currency, format: formatMoney } = useCurrency()
  const transactions = useFinanceStore((s) => s.transactions)

  const yearMonth = formatYearMonth(new Date())
  const monthTx = selectByMonth(transactions, yearMonth)
  const incomeTx = selectByType(monthTx, 'income')
  const totals = selectTotalsByType(incomeTx, currency)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {INCOME_KINDS.map((kind) => {
        const kindTx = selectByKind(incomeTx, kind)
        const kindTotal = selectTotalsByType(kindTx, currency)
        return (
          <Card key={kind} padded className="flex flex-col gap-2">
            <span className="text-sm text-ink-muted">{t(`summary.${kind}`)}</span>
            <span className="font-mono text-xl font-semibold tabular text-positive">{formatMoney(kindTotal.income, currency)}</span>
            <span className="text-xs text-ink-muted">{kindTx.length} {t('common:units.total').toLowerCase()}</span>
          </Card>
        )
      })}
      <Card padded className="flex flex-col gap-2 bg-brand-50 border-brand-100">
        <span className="text-sm text-ink-muted">{t('common:transactionType.income')}</span>
        <span className="font-mono text-xl font-semibold tabular text-brand-700">{formatMoney(totals.income, currency)}</span>
      </Card>
    </div>
  )
}