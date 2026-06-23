import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Textarea } from '@/shared/ui/Textarea'
import { CurrencyInput } from '@/shared/ui/CurrencyInput'
import { DateInput } from '@/shared/ui/DateInput'
import { Select } from '@/shared/ui/Select'
import { useFinanceStore } from '@/shared/api'
import { useCurrency } from '@/app/providers/useCurrency'
import { useToast } from '@/app/providers/useToast'
import { formatISODate } from '@/entities/transaction'
import type { CurrencyCode } from '@/shared/lib/constants'
import { isPositiveAmount, isRequired } from '@/shared/lib/validation'
import type { Loan } from '@/entities/loan'

interface LoanFormProps {
  initial?: Loan
  onDone: () => void
}

export function LoanForm({ initial, onDone }: LoanFormProps) {
  const { t } = useTranslation(['loans', 'common'])
  const { currency } = useCurrency()
  const { toast } = useToast()
  const addLoan = useFinanceStore((s) => s.addLoan)
  const updateLoan = useFinanceStore((s) => s.updateLoan)

  const [debtor, setDebtor] = useState(initial?.debtor ?? '')
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [loanCurrency, setLoanCurrency] = useState<CurrencyCode>(initial?.currency ?? currency)
  const [date, setDate] = useState(initial?.date ?? formatISODate(new Date()))
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!isRequired(debtor)) newErrors.debtor = t('common:misc.none')
    if (!isPositiveAmount(parseFloat(amount))) newErrors.amount = t('common:validation.required.amount')

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const payload = {
      debtor: debtor.trim(),
      amount: parseFloat(amount),
      currency: loanCurrency,
      date,
      notes: notes.trim() || undefined,
    }

    if (initial) {
      updateLoan(initial.id, payload)
      toast(t('common:toast.updated'))
    } else {
      addLoan(payload)
      toast(t('common:toast.added'))
    }
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label={t('form.debtor')} value={debtor} onChange={(e) => setDebtor(e.target.value)} error={errors.debtor} placeholder="Mike" />
      <div className="grid grid-cols-2 gap-3">
        <CurrencyInput label={t('form.amount')} currency={loanCurrency} value={amount} onChange={(e) => setAmount(e.target.value)} error={errors.amount} placeholder="0.00" />
        <Select label={t('common:misc.currency')} options={[{ value: 'USD', label: 'USD' }, { value: 'CRC', label: 'CRC' }]} value={loanCurrency} onChange={(e) => setLoanCurrency(e.target.value as CurrencyCode)} />
      </div>
      <DateInput label={t('form.date')} value={date} onChange={(e) => setDate(e.target.value)} />
      <Textarea label={t('form.notes')} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opcional" />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onDone}>{t('common:actions.cancel')}</Button>
        <Button type="submit">{initial ? t('common:actions.save') : t('common:actions.add')}</Button>
      </div>
    </form>
  )
}