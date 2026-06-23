import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { Switch } from '@/shared/ui/Switch'
import { CurrencyInput } from '@/shared/ui/CurrencyInput'
import { DateInput } from '@/shared/ui/DateInput'
import { SegmentedControl } from '@/shared/ui/SegmentedControl'
import { useFinanceStore } from '@/shared/api'
import { useCurrency } from '@/app/providers/useCurrency'
import { useToast } from '@/app/providers/useToast'
import { INCOME_KINDS, EXPENSE_KINDS, type TransactionType, type TransactionKind, type CurrencyCode } from '@/shared/lib/constants'
import { selectCategoriesByKind } from '@/entities/category'
import { formatISODate, type Transaction } from '@/entities/transaction'
import { isPositiveAmount } from '@/shared/lib/validation'

interface TransactionFormProps {
  initial?: Transaction
  onDone: () => void
}

export function TransactionForm({ initial, onDone }: TransactionFormProps) {
  const { t } = useTranslation(['validation', 'common'])
  const { currency } = useCurrency()
  const { toast } = useToast()
  const addTransaction = useFinanceStore((s) => s.addTransaction)
  const updateTransaction = useFinanceStore((s) => s.updateTransaction)
  const categories = useFinanceStore((s) => s.categories)

  const [type, setType] = useState<TransactionType>(initial?.type ?? 'income')
  const [kind, setKind] = useState<TransactionKind>(initial?.kind ?? 'salary')
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '')
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [txCurrency, setTxCurrency] = useState<CurrencyCode>(initial?.currency ?? currency)
  const [date, setDate] = useState(initial?.date ?? formatISODate(new Date()))
  const [description, setDescription] = useState(initial?.description ?? '')
  const [recurring, setRecurring] = useState(initial?.recurring ?? false)
  const [recurringInterval, setRecurringInterval] = useState<Transaction['recurringInterval']>(initial?.recurringInterval ?? 'monthly')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const kinds = type === 'income' ? INCOME_KINDS : EXPENSE_KINDS
  const availableCategories = selectCategoriesByKind(categories, type, kind)

  const handleTypeChange = (next: string) => {
    setType(next as TransactionType)
    const nextKinds = next === 'income' ? INCOME_KINDS : EXPENSE_KINDS
    if (!nextKinds.includes(kind as never)) {
      setKind(nextKinds[0])
    }
    setCategoryId('')
  }

  const handleKindChange = (next: string) => {
    setKind(next as TransactionKind)
    setCategoryId('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    const numericAmount = parseFloat(amount)
    if (!isPositiveAmount(numericAmount)) newErrors.amount = t('required.amount')
    if (!categoryId) newErrors.category = t('required.category')
    if (!description.trim()) newErrors.description = t('required.description')
    if (!date) newErrors.date = t('required.date')

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const payload = {
      type,
      kind,
      categoryId,
      amount: numericAmount,
      currency: txCurrency,
      date,
      description: description.trim(),
      recurring,
      recurringInterval: recurring ? recurringInterval : undefined,
    }

    if (initial) {
      updateTransaction(initial.id, payload)
      toast(t('common:toast.updated'))
    } else {
      addTransaction(payload)
      toast(t('common:toast.added'))
    }
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <SegmentedControl
        options={[
          { value: 'income', label: t('types.income') },
          { value: 'expense', label: t('types.expense') },
        ]}
        value={type}
        onChange={handleTypeChange}
      />
      <Select
        label={t('fields.kind')}
        options={kinds.map((k) => ({ value: k, label: t(`common:kinds.${k}`) }))}
        value={kind}
        onChange={(e) => handleKindChange(e.target.value)}
      />
      <Select
        label={t('fields.category')}
        options={availableCategories.map((c) => ({ value: c.id, label: `${c.icon} ${t(c.nameKey)}` }))}
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        error={errors.category}
      />
      <div className="grid grid-cols-2 gap-3">
        <CurrencyInput
          label={t('fields.amount')}
          currency={txCurrency}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
          placeholder="0.00"
        />
        <Select
          label={t('fields.currency')}
          options={[{ value: 'USD', label: 'USD' }, { value: 'CRC', label: 'CRC' }]}
          value={txCurrency}
          onChange={(e) => setTxCurrency(e.target.value as CurrencyCode)}
        />
      </div>
      <DateInput
        label={t('fields.date')}
        value={date}
        onChange={(e) => setDate(e.target.value)}
        error={errors.date}
      />
      <Input
        label={t('fields.description')}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={errors.description}
        placeholder={type === 'income' ? 'Salario mensual' : 'Supermercado'}
      />
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink">{t('fields.recurring')}</span>
        <Switch checked={recurring} onChange={setRecurring} label={t('fields.recurring')} />
      </div>
      {recurring && (
        <Select
          label={t('fields.interval')}
          options={[
            { value: 'weekly', label: t('common:recurrence.weekly') },
            { value: 'monthly', label: t('common:recurrence.monthly') },
            { value: 'yearly', label: t('common:recurrence.yearly') },
          ]}
          value={recurringInterval ?? 'monthly'}
          onChange={(e) => setRecurringInterval(e.target.value as Transaction['recurringInterval'])}
        />
      )}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onDone}>{t('common:actions.cancel')}</Button>
        <Button type="submit">{initial ? t('common:actions.save') : t('common:actions.add')}</Button>
      </div>
    </form>
  )
}