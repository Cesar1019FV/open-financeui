import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PageHeader } from '@/shared/ui/PageHeader'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { Stat } from '@/shared/ui/Stat'
import { useCurrency } from '@/app/providers/useCurrency'
import { useFinanceStore } from '@/shared/api'
import { goalCurrentInCurrency, goalTargetInCurrency } from '@/entities/savings-goal'
import { SavingsGoalsGrid } from '@/widgets/savings-goals-grid'
import { EmergencyFundCard } from '@/widgets/emergency-fund-card'
import { SavingsGoalForm } from '@/features/savings-goal-manage'

export function SavingsPage() {
  const { t } = useTranslation(['savings'])
  const { currency, format: formatMoney } = useCurrency()
  const savingsGoals = useFinanceStore((s) => s.savingsGoals)
  const [showForm, setShowForm] = useState(false)

  const totalSaved = useMemo(() => {
    return savingsGoals.reduce((sum, g) => sum + goalCurrentInCurrency(g, currency), 0)
  }, [savingsGoals, currency])

  const totalGoals = useMemo(() => {
    return savingsGoals.reduce((sum, g) => sum + goalTargetInCurrency(g, currency), 0)
  }, [savingsGoals, currency])

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        actions={<Button iconLeft="plus" onClick={() => setShowForm(true)}>{t('addGoal')}</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Stat label={t('totalSaved')} value={formatMoney(totalSaved, currency)} intent="positive" icon="savings" />
        <Stat label={t('totalGoals')} value={formatMoney(totalGoals, currency)} intent="default" icon="balance" />
      </div>

      <EmergencyFundCard />

      <SavingsGoalsGrid />

      <Modal open={showForm} onClose={() => setShowForm(false)} title={t('form.title')}>
        <SavingsGoalForm onDone={() => setShowForm(false)} />
      </Modal>
    </div>
  )
}