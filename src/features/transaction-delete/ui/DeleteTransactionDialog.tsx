import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { useFinanceStore } from '@/shared/api'
import { useToast } from '@/app/providers/useToast'
import type { Transaction } from '@/entities/transaction'

interface DeleteTransactionDialogProps {
  transaction: Transaction | null
  onClose: () => void
}

export function DeleteTransactionDialog({ transaction, onClose }: DeleteTransactionDialogProps) {
  const { t } = useTranslation(['validation', 'common'])
  const deleteTransaction = useFinanceStore((s) => s.deleteTransaction)
  const { toast } = useToast()

  const handleConfirm = () => {
    if (!transaction) return
    deleteTransaction(transaction.id)
    toast(t('common:toast.deleted'))
    onClose()
  }

  return (
    <Modal open={Boolean(transaction)} onClose={onClose} title={t('delete.title')} size="sm">
      <p className="text-sm text-ink-muted mb-5">{t('delete.confirm')}</p>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>{t('common:actions.cancel')}</Button>
        <Button variant="danger" onClick={handleConfirm}>{t('common:actions.delete')}</Button>
      </div>
    </Modal>
  )
}