import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PageHeader } from '@/shared/ui/PageHeader'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { IncomeSummaryCards } from '@/widgets/income-summary-cards'
import { TransactionHistoryTable } from '@/widgets/transaction-history-table'
import { TransactionForm } from '@/features/transaction-create'

export function IncomePage() {
  const { t } = useTranslation(['income'])
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        actions={<Button iconLeft="plus" onClick={() => setShowForm(true)}>{t('addIncome')}</Button>}
      />
      <IncomeSummaryCards />
      <TransactionHistoryTable lockType="income" showFilters />

      <Modal open={showForm} onClose={() => setShowForm(false)} title={t('addIncome')}>
        <TransactionForm onDone={() => setShowForm(false)} />
      </Modal>
    </div>
  )
}