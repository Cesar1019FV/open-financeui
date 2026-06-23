import { useTranslation } from 'react-i18next'

import { Card } from '@/shared/ui/Card'
import { useCurrency } from '@/app/providers/useCurrency'
import { useFinanceStore } from '@/shared/api'
import { selectNetWorth } from '@/entities/account-summary'

export function NetWorthCard() {
  const { t } = useTranslation(['dashboard'])
  const { currency, format: formatMoney } = useCurrency()
  const transactions = useFinanceStore((s) => s.transactions)
  const debts = useFinanceStore((s) => s.debts)
  const loans = useFinanceStore((s) => s.loans)
  const savingsGoals = useFinanceStore((s) => s.savingsGoals)
  const investments = useFinanceStore((s) => s.investments)

  const netWorth = selectNetWorth({ transactions, debts, loans, savingsGoals, investments }, currency)

  const items: Array<{ label: string; value: number; intent: 'positive' | 'negative' }> = [
    { label: t('netWorth.savings'), value: netWorth.savings, intent: 'positive' },
    { label: t('netWorth.investments'), value: netWorth.investments, intent: 'positive' },
    { label: t('netWorth.receivable'), value: netWorth.receivable, intent: 'positive' },
    { label: t('netWorth.debts'), value: -netWorth.debts, intent: 'negative' },
  ]

  return (
    <Card padded className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold text-ink">{t('netWorth.total')}</h2>
        <span className={`font-mono text-2xl font-semibold tabular ${netWorth.total >= 0 ? 'text-ink' : 'text-negative'}`}>
          {formatMoney(netWorth.total, currency)}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col gap-1">
            <span className="text-xs text-ink-muted">{item.label}</span>
            <span className={`font-mono text-sm font-semibold tabular ${item.intent === 'positive' ? 'text-positive' : 'text-negative'}`}>
              {formatMoney(Math.abs(item.value), currency)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}