import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { useFinanceStore } from '@/shared/api'
import { useToast } from '@/app/providers/useToast'
import type { Debt } from '@/entities/debt'

interface DeleteDebtDialogProps {
  debt: Debt | null
  onClose: () => void
}

export function DeleteDebtDialog({ debt, onClose }: DeleteDebtDialogProps) {
  const { t } = useTranslation(['debts', 'common'])
  const deleteDebt = useFinanceStore((s) => s.deleteDebt)
  const { toast } = useToast()

  const handleConfirm = () => {
    if (!debt) return
    deleteDebt(debt.id)
    toast(t('common:toast.deleted'))
    onClose()
  }

  return (
    <Modal open={Boolean(debt)} onClose={onClose} title={t('delete.title')} size="sm">
      <p className="text-sm text-ink-muted mb-5">{t('delete.confirm')}</p>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>{t('common:actions.cancel')}</Button>
        <Button variant="danger" onClick={handleConfirm}>{t('common:actions.delete')}</Button>
      </div>
    </Modal>
  )
}