import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format, parseISO } from 'date-fns'

import { PageHeader } from '@/shared/ui/PageHeader'
import { Card } from '@/shared/ui/Card'
import { Stat } from '@/shared/ui/Stat'
import { DateInput } from '@/shared/ui/DateInput'
import { Table, type Column } from '@/shared/ui/Table'
import { EmptyState } from '@/shared/ui/EmptyState'
import { useCurrency } from '@/app/providers/useCurrency'
import { useFinanceStore } from '@/shared/api'
import { selectMonthlySummary, selectCategoryBreakdown } from '@/entities/account-summary'
import { selectCategoryById } from '@/entities/category'
import { MonthlyComparisonBar } from '@/widgets/monthly-comparison-bar'
import { CategoryBreakdownPie } from '@/widgets/category-breakdown-pie'
import { formatPercent } from '@/shared/lib/format'
import { formatYearMonth } from '@/entities/transaction'

export function BalancePage() {
  const { t, i18n } = useTranslation(['balance', 'common'])
  const { currency, format: formatMoney } = useCurrency()
  const transactions = useFinanceStore((s) => s.transactions)
  const categories = useFinanceStore((s) => s.categories)

  const [month, setMonth] = useState(formatYearMonth(new Date()))

  const state = { transactions, debts: [], loans: [], savingsGoals: [], investments: [] }
  const summary = selectMonthlySummary(state, month, currency)
  const breakdown = selectCategoryBreakdown(state, month, currency)
  const categoryMap = selectCategoryById(categories)

  const monthLabel = format(parseISO(`${month}-01`), 'MMMM yyyy', { locale: undefined })

  const breakdownColumns: Column<{ categoryId: string; amount: number; percent: number }>[] = [
    {
      key: 'category',
      header: t('table.category'),
      render: (row) => {
        const cat = categoryMap.get(row.categoryId)
        return cat ? (
          <span className="inline-flex items-center gap-1.5">
            <span>{cat.icon}</span>
            <span>{t(cat.nameKey)}</span>
          </span>
        ) : '—'
      },
    },
    {
      key: 'amount',
      header: t('table.amount'),
      align: 'right',
      sortable: true,
      sortAccessor: (row) => row.amount,
      render: (row) => <span className="font-mono tabular text-negative">{formatMoney(row.amount, currency)}</span>,
    },
    {
      key: 'percent',
      header: t('table.percent'),
      align: 'right',
      sortable: true,
      sortAccessor: (row) => row.percent,
      render: (row) => <span className="font-mono tabular text-ink-muted">{formatPercent(row.percent, i18n.language)}</span>,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        actions={
          <DateInput
            inputType="month"
            value={month}
            onChange={(e) => setMonth(e.target.value || formatYearMonth(new Date()))}
            aria-label={t('monthSelector')}
          />
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat
          label={t('vsPrevious.income')}
          value={formatMoney(summary.totalIncome, currency)}
          intent="positive"
          icon="income"
          trend={summary.vsPrevious.incomeDelta !== 0 ? { value: formatMoney(Math.abs(summary.vsPrevious.incomeDelta), currency), intent: summary.vsPrevious.incomeDelta >= 0 ? 'positive' : 'negative' } : undefined}
        />
        <Stat
          label={t('vsPrevious.expense')}
          value={formatMoney(summary.totalExpense, currency)}
          intent="negative"
          icon="expense"
          trend={summary.vsPrevious.expenseDelta !== 0 ? { value: formatMoney(Math.abs(summary.vsPrevious.expenseDelta), currency), intent: summary.vsPrevious.expenseDelta <= 0 ? 'positive' : 'negative' } : undefined}
        />
        <Stat
          label={t('vsPrevious.net')}
          value={formatMoney(summary.net, currency)}
          intent={summary.net >= 0 ? 'positive' : 'negative'}
          icon="balance"
          trend={summary.vsPrevious.netDelta !== 0 ? { value: formatMoney(Math.abs(summary.vsPrevious.netDelta), currency), intent: summary.vsPrevious.netDelta >= 0 ? 'positive' : 'negative' } : undefined}
        />
      </div>

      <MonthlyComparisonBar />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card padded className="flex flex-col gap-4">
            <h2 className="text-base font-semibold text-ink">{t('comparison.byCategory')}</h2>
            {breakdown.length === 0 ? (
              <EmptyState title={t('empty.title', { month: monthLabel })} description={t('empty.description')} />
            ) : (
              <Table
                columns={breakdownColumns}
                rows={breakdown}
                rowKey={(row) => row.categoryId}
                caption={`${t('comparison.byCategory')} - ${monthLabel}`}
              />
            )}
          </Card>
        </div>
        <CategoryBreakdownPie />
      </div>
    </div>
  )
}