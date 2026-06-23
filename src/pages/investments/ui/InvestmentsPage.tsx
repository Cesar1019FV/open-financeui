import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PageHeader } from '@/shared/ui/PageHeader'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { Stat } from '@/shared/ui/Stat'
import { useCurrency } from '@/app/providers/useCurrency'
import { useFinanceStore } from '@/shared/api'
import { returnValue, investedInCurrency, currentValueInCurrency } from '@/entities/investment'
import { InvestmentsPortfolio } from '@/widgets/investments-portfolio'
import { InvestmentForm } from '@/features/investment-track'

export function InvestmentsPage() {
  const { t } = useTranslation(['investments'])
  const { currency, format: formatMoney } = useCurrency()
  const investments = useFinanceStore((s) => s.investments)
  const [showForm, setShowForm] = useState(false)

  const totals = useMemo(() => {
    let invested = 0
    let current = 0
    let returns = 0
    for (const inv of investments) {
      invested += investedInCurrency(inv, currency)
      current += currentValueInCurrency(inv, currency)
      returns += returnValue(inv)
    }
    return { invested, current, returns }
  }, [investments, currency])

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        actions={<Button iconLeft="plus" onClick={() => setShowForm(true)}>{t('addInvestment')}</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat label={t('totalInvested')} value={formatMoney(totals.invested, currency)} intent="default" icon="investment" />
        <Stat label={t('currentValue')} value={formatMoney(totals.current, currency)} intent="default" icon="balance" />
        <Stat
          label={t('totalReturn')}
          value={`${totals.returns >= 0 ? '+' : ''}${formatMoney(Math.abs(totals.returns), currency)}`}
          intent={totals.returns >= 0 ? 'positive' : 'negative'}
          icon={totals.returns >= 0 ? 'arrow-up' : 'arrow-down'}
        />
      </div>

      <InvestmentsPortfolio />

      <Modal open={showForm} onClose={() => setShowForm(false)} title={t('form.title')}>
        <InvestmentForm onDone={() => setShowForm(false)} />
      </Modal>
    </div>
  )
}