import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { CurrencyInput } from '@/shared/ui/CurrencyInput'
import { useFinanceStore } from '@/shared/api'
import { useToast } from '@/app/providers/useToast'
import { isPositiveAmount } from '@/shared/lib/validation'
import type { Investment } from '@/entities/investment'

interface UpdateValueDialogProps {
  investment: Investment | null
  onClose: () => void
}

export function UpdateValueDialog({ investment, onClose }: UpdateValueDialogProps) {
  const { t } = useTranslation(['investments', 'common'])
  const updateInvestmentValue = useFinanceStore((s) => s.updateInvestmentValue)
  const { toast } = useToast()

  const [price, setPrice] = useState('')
  const [error, setError] = useState('')

  if (!investment) return null

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    const numericPrice = parseFloat(price)
    if (!isPositiveAmount(numericPrice)) {
      setError(t('common:validation.required.amount'))
      return
    }
    updateInvestmentValue(investment.id, numericPrice)
    toast(t('updateValue.success'))
    setPrice('')
    onClose()
  }

  return (
    <Modal open={Boolean(investment)} onClose={onClose} title={t('updateValue.title', { name: investment.name })} size="sm">
      <form onSubmit={handleConfirm} className="flex flex-col gap-4">
        <CurrencyInput label={t('updateValue.currentPrice')} currency={investment.currency} value={price} onChange={(e) => setPrice(e.target.value)} error={error} placeholder={String(investment.currentPrice)} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>{t('common:actions.cancel')}</Button>
          <Button type="submit">{t('common:actions.update')}</Button>
        </div>
      </form>
    </Modal>
  )
}