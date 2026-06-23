import { useTranslation } from 'react-i18next'

import { PageHeader } from '@/shared/ui/PageHeader'
import { TransactionHistoryTable } from '@/widgets/transaction-history-table'

export function HistoryPage() {
  const { t } = useTranslation(['history'])

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <TransactionHistoryTable showFilters showCsvExport />
    </div>
  )
}