import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { CurrencyInput } from '@/shared/ui/CurrencyInput'
import { useFinanceStore } from '@/shared/api'
import { useToast } from '@/app/providers/useToast'
import { isPositiveAmount } from '@/shared/lib/validation'
import type { SavingsGoal } from '@/entities/savings-goal'

interface ContributionDialogProps {
  goal: SavingsGoal | null
  onClose: () => void
}

export function ContributionDialog({ goal, onClose }: ContributionDialogProps) {
  const { t } = useTranslation(['savings', 'common'])
  const contributeToGoal = useFinanceStore((s) => s.contributeToGoal)
  const { toast } = useToast()

  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  if (!goal) return null

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    const numericAmount = parseFloat(amount)
    if (!isPositiveAmount(numericAmount)) {
      setError(t('common:validation.required.amount'))
      return
    }
    contributeToGoal(goal.id, numericAmount)
    toast(t('contribute.success'))
    setAmount('')
    onClose()
  }

  return (
    <Modal open={Boolean(goal)} onClose={onClose} title={t('contribute.title', { name: goal.name })} size="sm">
      <form onSubmit={handleConfirm} className="flex flex-col gap-4">
        <CurrencyInput label={t('contribute.amount')} currency={goal.currency} value={amount} onChange={(e) => setAmount(e.target.value)} error={error} placeholder="0.00" />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>{t('common:actions.cancel')}</Button>
          <Button type="submit">{t('common:actions.contribute')}</Button>
        </div>
      </form>
    </Modal>
  )
}