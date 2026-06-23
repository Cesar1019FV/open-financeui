import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { useFinanceStore } from '@/shared/api'
import { useToast } from '@/app/providers/useToast'
import { remainingInstallments, isPaidOff } from '@/entities/debt'
import type { Debt } from '@/entities/debt'

interface InstallmentPaymentDialogProps {
  debt: Debt | null
  onClose: () => void
}

export function InstallmentPaymentDialog({ debt, onClose }: InstallmentPaymentDialogProps) {
  const { t } = useTranslation(['debts', 'common'])
  const payInstallment = useFinanceStore((s) => s.payDebtInstallment)
  const { toast } = useToast()

  if (!debt) return null

  const handleConfirm = () => {
    payInstallment(debt.id)
    toast(t('installmentPayment.success'))
    onClose()
  }

  const remaining = remainingInstallments(debt)
  const nextInstallmentNumber = debt.installmentsPaid + 1

  return (
    <Modal open={Boolean(debt)} onClose={onClose} title={t('installmentPayment.title')} size="sm">
      <p className="text-sm text-ink-muted mb-5">
        {t('installmentPayment.confirm', { n: nextInstallmentNumber, total: debt.installmentsTotal })}
      </p>
      {!isPaidOff(debt) && remaining > 0 && (
        <p className="text-xs text-ink-muted mb-4">
          {t('fields.installmentsLeft', { n: remaining - 1 })}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>{t('common:actions.cancel')}</Button>
        <Button onClick={handleConfirm}>{t('common:actions.pay')}</Button>
      </div>
    </Modal>
  )
}