import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { useFinanceStore } from '@/shared/api'
import { useToast } from '@/app/providers/useToast'
import type { SavingsGoal } from '@/entities/savings-goal'

interface DeleteGoalDialogProps {
  goal: SavingsGoal | null
  onClose: () => void
}

export function DeleteGoalDialog({ goal, onClose }: DeleteGoalDialogProps) {
  const { t } = useTranslation(['savings', 'common'])
  const deleteSavingsGoal = useFinanceStore((s) => s.deleteSavingsGoal)
  const { toast } = useToast()

  const handleConfirm = () => {
    if (!goal) return
    deleteSavingsGoal(goal.id)
    toast(t('common:toast.deleted'))
    onClose()
  }

  return (
    <Modal open={Boolean(goal)} onClose={onClose} title={t('delete.title')} size="sm">
      <p className="text-sm text-ink-muted mb-5">{t('delete.confirm')}</p>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>{t('common:actions.cancel')}</Button>
        <Button variant="danger" onClick={handleConfirm}>{t('common:actions.delete')}</Button>
      </div>
    </Modal>
  )
}