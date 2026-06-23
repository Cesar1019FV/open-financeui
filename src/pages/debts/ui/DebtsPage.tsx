import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PageHeader } from '@/shared/ui/PageHeader'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { Stat } from '@/shared/ui/Stat'
import { EmptyState } from '@/shared/ui/EmptyState'
import { useCurrency } from '@/app/providers/useCurrency'
import { useFinanceStore } from '@/shared/api'
import { remainingInCurrency } from '@/entities/debt'
import { DebtsOverview } from '@/widgets/debts-overview'
import { DebtForm } from '@/features/debt-track'

export function DebtsPage() {
  const { t } = useTranslation(['debts'])
  const { currency, format: formatMoney } = useCurrency()
  const debts = useFinanceStore((s) => s.debts)
  const [showForm, setShowForm] = useState(false)

  const totalPending = useMemo(() => {
    return debts.reduce((sum, d) => sum + remainingInCurrency(d, currency), 0)
  }, [debts, currency])

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        actions={<Button iconLeft="plus" onClick={() => setShowForm(true)}>{t('addDebt')}</Button>}
      />

      {debts.length === 0 ? (
        <Card padded>
          <EmptyState
            title={t('empty.title')}
            description={t('empty.description')}
            action={<Button iconLeft="plus" onClick={() => setShowForm(true)}>{t('addDebt')}</Button>}
          />
        </Card>
      ) : (
        <>
          <Stat
            label={t('totalPending')}
            value={formatMoney(totalPending, currency)}
            intent="negative"
            icon="debt"
          />
          <DebtsOverview />
        </>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={t('form.title')}>
        <DebtForm onDone={() => setShowForm(false)} />
      </Modal>
    </div>
  )
}