import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { useFinanceStore } from '@/shared/api'
import { useToast } from '@/app/providers/useToast'
import type { Investment } from '@/entities/investment'

interface DeleteInvestmentDialogProps {
  investment: Investment | null
  onClose: () => void
}

export function DeleteInvestmentDialog({ investment, onClose }: DeleteInvestmentDialogProps) {
  const { t } = useTranslation(['investments', 'common'])
  const deleteInvestment = useFinanceStore((s) => s.deleteInvestment)
  const { toast } = useToast()

  const handleConfirm = () => {
    if (!investment) return
    deleteInvestment(investment.id)
    toast(t('common:toast.deleted'))
    onClose()
  }

  return (
    <Modal open={Boolean(investment)} onClose={onClose} title={t('delete.title')} size="sm">
      <p className="text-sm text-ink-muted mb-5">{t('delete.confirm')}</p>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>{t('common:actions.cancel')}</Button>
        <Button variant="danger" onClick={handleConfirm}>{t('common:actions.delete')}</Button>
      </div>
    </Modal>
  )
}