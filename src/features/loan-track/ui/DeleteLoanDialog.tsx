import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { useFinanceStore } from '@/shared/api'
import { useToast } from '@/app/providers/useToast'
import type { Loan } from '@/entities/loan'

interface DeleteLoanDialogProps {
  loan: Loan | null
  onClose: () => void
}

export function DeleteLoanDialog({ loan, onClose }: DeleteLoanDialogProps) {
  const { t } = useTranslation(['loans', 'common'])
  const deleteLoan = useFinanceStore((s) => s.deleteLoan)
  const { toast } = useToast()

  const handleConfirm = () => {
    if (!loan) return
    deleteLoan(loan.id)
    toast(t('common:toast.deleted'))
    onClose()
  }

  return (
    <Modal open={Boolean(loan)} onClose={onClose} title={t('delete.title')} size="sm">
      <p className="text-sm text-ink-muted mb-5">{t('delete.confirm')}</p>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>{t('common:actions.cancel')}</Button>
        <Button variant="danger" onClick={handleConfirm}>{t('common:actions.delete')}</Button>
      </div>
    </Modal>
  )
}