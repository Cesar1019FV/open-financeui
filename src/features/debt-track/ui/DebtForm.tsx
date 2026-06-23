import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { Textarea } from '@/shared/ui/Textarea'
import { CurrencyInput } from '@/shared/ui/CurrencyInput'
import { DateInput } from '@/shared/ui/DateInput'
import { useFinanceStore } from '@/shared/api'
import { useCurrency } from '@/app/providers/useCurrency'
import { useToast } from '@/app/providers/useToast'
import { formatISODate } from '@/entities/transaction'
import type { CurrencyCode } from '@/shared/lib/constants'
import { isPositiveAmount, isRequired } from '@/shared/lib/validation'
import type { Debt } from '@/entities/debt'

interface DebtFormProps {
  initial?: Debt
  onDone: () => void
}

export function DebtForm({ initial, onDone }: DebtFormProps) {
  const { t } = useTranslation(['debts', 'common'])
  const { currency } = useCurrency()
  const { toast } = useToast()
  const addDebt = useFinanceStore((s) => s.addDebt)
  const updateDebt = useFinanceStore((s) => s.updateDebt)

  const [creditor, setCreditor] = useState(initial?.creditor ?? '')
  const [totalAmount, setTotalAmount] = useState(initial ? String(initial.totalAmount) : '')
  const [installmentAmount, setInstallmentAmount] = useState(initial ? String(initial.installmentAmount) : '')
  const [installmentsTotal, setInstallmentsTotal] = useState(initial ? String(initial.installmentsTotal) : '')
  const [interestRate, setInterestRate] = useState(initial ? String(initial.interestRate) : '0')
  const [startDate, setStartDate] = useState(initial?.startDate ?? formatISODate(new Date()))
  const [dueDay, setDueDay] = useState(initial ? String(initial.dueDay) : '15')
  const [debtCurrency, setDebtCurrency] = useState<CurrencyCode>(initial?.currency ?? currency)
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!isRequired(creditor)) newErrors.creditor = t('common:misc.none')
    if (!isPositiveAmount(parseFloat(totalAmount))) newErrors.totalAmount = t('common:validation.required.amount')
    if (!isPositiveAmount(parseFloat(installmentAmount)) && parseFloat(installmentsTotal) > 0) newErrors.installmentAmount = t('common:validation.required.amount')

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const payload = {
      creditor: creditor.trim(),
      totalAmount: parseFloat(totalAmount),
      currency: debtCurrency,
      installmentAmount: parseFloat(installmentAmount) || 0,
      installmentsTotal: parseInt(installmentsTotal) || 0,
      installmentsPaid: initial?.installmentsPaid ?? 0,
      interestRate: parseFloat(interestRate) || 0,
      startDate,
      dueDay: Math.min(28, Math.max(1, parseInt(dueDay) || 15)),
      notes: notes.trim() || undefined,
    }

    if (initial) {
      updateDebt(initial.id, payload)
      toast(t('common:toast.updated'))
    } else {
      addDebt(payload)
      toast(t('common:toast.added'))
    }
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label={t('form.creditor')} value={creditor} onChange={(e) => setCreditor(e.target.value)} error={errors.creditor} placeholder="Banco A" />
      <div className="grid grid-cols-2 gap-3">
        <CurrencyInput label={t('form.totalAmount')} currency={debtCurrency} value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} error={errors.totalAmount} placeholder="0.00" />
        <Select label={t('common:misc.currency')} options={[{ value: 'USD', label: 'USD' }, { value: 'CRC', label: 'CRC' }]} value={debtCurrency} onChange={(e) => setDebtCurrency(e.target.value as CurrencyCode)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <CurrencyInput label={t('form.installmentAmount')} currency={debtCurrency} value={installmentAmount} onChange={(e) => setInstallmentAmount(e.target.value)} error={errors.installmentAmount} placeholder="0.00" />
        <Input label={t('form.installmentsTotal')} type="number" value={installmentsTotal} onChange={(e) => setInstallmentsTotal(e.target.value)} placeholder="12" />
      </div>
      <Input label={t('form.interestRate')} type="number" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} placeholder="0" />
      <div className="grid grid-cols-2 gap-3">
        <DateInput label={t('form.startDate')} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input label={t('form.dueDay')} type="number" min={1} max={28} value={dueDay} onChange={(e) => setDueDay(e.target.value)} />
      </div>
      <Textarea label={t('form.notes')} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opcional" />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onDone}>{t('common:actions.cancel')}</Button>
        <Button type="submit">{initial ? t('common:actions.save') : t('common:actions.add')}</Button>
      </div>
    </form>
  )
}