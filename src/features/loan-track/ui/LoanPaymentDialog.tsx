import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { CurrencyInput } from '@/shared/ui/CurrencyInput'
import { DateInput } from '@/shared/ui/DateInput'
import { useFinanceStore } from '@/shared/api'
import { useToast } from '@/app/providers/useToast'
import { formatISODate } from '@/entities/transaction'
import { loanRemaining } from '@/entities/loan'
import { isPositiveAmount } from '@/shared/lib/validation'
import type { Loan } from '@/entities/loan'

interface LoanPaymentDialogProps {
  loan: Loan | null
  onClose: () => void
}

export function LoanPaymentDialog({ loan, onClose }: LoanPaymentDialogProps) {
  const { t } = useTranslation(['loans', 'common'])
  const registerLoanPayment = useFinanceStore((s) => s.registerLoanPayment)
  const { toast } = useToast()

  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(formatISODate(new Date()))
  const [error, setError] = useState('')

  if (!loan) return null

  const remaining = loanRemaining(loan)

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    const numericAmount = parseFloat(amount)
    if (!isPositiveAmount(numericAmount)) {
      setError(t('common:validation.required.amount'))
      return
    }
    registerLoanPayment(loan.id, { date, amount: numericAmount })
    toast(t('registerPayment.success'))
    setAmount('')
    onClose()
  }

  return (
    <Modal open={Boolean(loan)} onClose={onClose} title={t('registerPayment.title')} size="sm">
      <form onSubmit={handleConfirm} className="flex flex-col gap-4">
        <p className="text-sm text-ink-muted">
          {t('fields.remaining')}: <span className="font-mono tabular text-ink">{remaining} {loan.currency}</span>
        </p>
        <CurrencyInput label={t('registerPayment.amount')} currency={loan.currency} value={amount} onChange={(e) => setAmount(e.target.value)} error={error} placeholder="0.00" />
        <DateInput label={t('registerPayment.date')} value={date} onChange={(e) => setDate(e.target.value)} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>{t('common:actions.cancel')}</Button>
          <Button type="submit">{t('common:actions.save')}</Button>
        </div>
      </form>
    </Modal>
  )
}