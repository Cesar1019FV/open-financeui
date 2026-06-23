import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { CurrencyInput } from '@/shared/ui/CurrencyInput'
import { DateInput } from '@/shared/ui/DateInput'
import { Select } from '@/shared/ui/Select'
import { Checkbox } from '@/shared/ui/Checkbox'
import { useFinanceStore } from '@/shared/api'
import { useCurrency } from '@/app/providers/useCurrency'
import { useToast } from '@/app/providers/useToast'
import type { CurrencyCode } from '@/shared/lib/constants'
import { isPositiveAmount, isRequired } from '@/shared/lib/validation'
import type { SavingsGoal } from '@/entities/savings-goal'

interface SavingsGoalFormProps {
  initial?: SavingsGoal
  onDone: () => void
}

export function SavingsGoalForm({ initial, onDone }: SavingsGoalFormProps) {
  const { t } = useTranslation(['savings', 'common'])
  const { currency } = useCurrency()
  const { toast } = useToast()
  const addSavingsGoal = useFinanceStore((s) => s.addSavingsGoal)
  const updateSavingsGoal = useFinanceStore((s) => s.updateSavingsGoal)

  const [name, setName] = useState(initial?.name ?? '')
  const [targetAmount, setTargetAmount] = useState(initial ? String(initial.targetAmount) : '')
  const [currentAmount, setCurrentAmount] = useState(initial ? String(initial.currentAmount) : '0')
  const [goalCurrency, setGoalCurrency] = useState<CurrencyCode>(initial?.currency ?? currency)
  const [targetDate, setTargetDate] = useState(initial?.targetDate ?? '')
  const [monthlyContribution, setMonthlyContribution] = useState(initial ? String(initial.monthlyContribution) : '0')
  const [isEmergencyFund, setIsEmergencyFund] = useState(initial?.isEmergencyFund ?? false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!isRequired(name)) newErrors.name = t('common:misc.none')
    if (!isPositiveAmount(parseFloat(targetAmount))) newErrors.targetAmount = t('common:validation.required.amount')

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const payload = {
      name: name.trim(),
      targetAmount: parseFloat(targetAmount),
      currency: goalCurrency,
      currentAmount: parseFloat(currentAmount) || 0,
      targetDate: targetDate || undefined,
      isEmergencyFund,
      monthlyContribution: parseFloat(monthlyContribution) || 0,
    }

    if (initial) {
      updateSavingsGoal(initial.id, payload)
      toast(t('common:toast.updated'))
    } else {
      addSavingsGoal(payload)
      toast(t('common:toast.added'))
    }
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label={t('form.name')} value={name} onChange={(e) => setName(e.target.value)} error={errors.name} placeholder="Vacaciones" />
      <div className="grid grid-cols-2 gap-3">
        <CurrencyInput label={t('form.targetAmount')} currency={goalCurrency} value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} error={errors.targetAmount} placeholder="0.00" />
        <Select label={t('common:misc.currency')} options={[{ value: 'USD', label: 'USD' }, { value: 'CRC', label: 'CRC' }]} value={goalCurrency} onChange={(e) => setGoalCurrency(e.target.value as CurrencyCode)} />
      </div>
      <CurrencyInput label={t('form.currentAmount')} currency={goalCurrency} value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} placeholder="0.00" />
      <div className="grid grid-cols-2 gap-3">
        <DateInput label={t('form.targetDate')} value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        <CurrencyInput label={t('form.monthlyContribution')} currency={goalCurrency} value={monthlyContribution} onChange={(e) => setMonthlyContribution(e.target.value)} placeholder="0.00" />
      </div>
      <Checkbox label={t('form.isEmergencyFund')} checked={isEmergencyFund} onChange={(e) => setIsEmergencyFund(e.target.checked)} />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onDone}>{t('common:actions.cancel')}</Button>
        <Button type="submit">{initial ? t('common:actions.save') : t('common:actions.add')}</Button>
      </div>
    </form>
  )
}