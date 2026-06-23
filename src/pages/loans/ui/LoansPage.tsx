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
import { loanRemainingInCurrency } from '@/entities/loan'
import { LoansOverview } from '@/widgets/loans-overview'
import { LoanForm } from '@/features/loan-track'

export function LoansPage() {
  const { t } = useTranslation(['loans'])
  const { currency, format: formatMoney } = useCurrency()
  const loans = useFinanceStore((s) => s.loans)
  const [showForm, setShowForm] = useState(false)

  const totalReceivable = useMemo(() => {
    return loans.reduce((sum, l) => sum + loanRemainingInCurrency(l, currency), 0)
  }, [loans, currency])

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        actions={<Button iconLeft="plus" onClick={() => setShowForm(true)}>{t('addLoan')}</Button>}
      />

      {loans.length === 0 ? (
        <Card padded>
          <EmptyState
            title={t('empty.title')}
            description={t('empty.description')}
            action={<Button iconLeft="plus" onClick={() => setShowForm(true)}>{t('addLoan')}</Button>}
          />
        </Card>
      ) : (
        <>
          <Stat
            label={t('totalReceivable')}
            value={formatMoney(totalReceivable, currency)}
            intent="positive"
            icon="loan"
          />
          <LoansOverview />
        </>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={t('form.title')}>
        <LoanForm onDone={() => setShowForm(false)} />
      </Modal>
    </div>
  )
}