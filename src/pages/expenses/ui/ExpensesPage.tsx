import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PageHeader } from '@/shared/ui/PageHeader'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { ExpenseSummaryCards } from '@/widgets/expense-summary-cards'
import { CategoryBreakdownPie } from '@/widgets/category-breakdown-pie'
import { TransactionHistoryTable } from '@/widgets/transaction-history-table'
import { TransactionForm } from '@/features/transaction-create'

export function ExpensesPage() {
  const { t } = useTranslation(['expenses'])
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        actions={<Button iconLeft="plus" onClick={() => setShowForm(true)}>{t('addExpense')}</Button>}
      />
      <ExpenseSummaryCards />
      <CategoryBreakdownPie />
      <TransactionHistoryTable lockType="expense" showFilters />

      <Modal open={showForm} onClose={() => setShowForm(false)} title={t('addExpense')}>
        <TransactionForm onDone={() => setShowForm(false)} />
      </Modal>
    </div>
  )
}