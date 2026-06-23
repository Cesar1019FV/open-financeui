import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { DateInput } from '@/shared/ui/DateInput'
import { CurrencyInput } from '@/shared/ui/CurrencyInput'
import { useFinanceStore } from '@/shared/api'
import { useCurrency } from '@/app/providers/useCurrency'
import { useToast } from '@/app/providers/useToast'
import { formatISODate } from '@/entities/transaction'
import type { ReminderType, ReminderRecurrence, CurrencyCode } from '@/shared/lib/constants'
import { isRequired, isPositiveAmount } from '@/shared/lib/validation'

interface ReminderFormProps {
  onDone: () => void
}

export function ReminderForm({ onDone }: ReminderFormProps) {
  const { t } = useTranslation(['settings', 'common'])
  const { currency } = useCurrency()
  const { toast } = useToast()
  const addReminder = useFinanceStore((s) => s.addReminder)

  const [title, setTitle] = useState('')
  const [type, setType] = useState<ReminderType>('payment')
  const [date, setDate] = useState(formatISODate(new Date()))
  const [hasAmount, setHasAmount] = useState(false)
  const [amount, setAmount] = useState('')
  const [reminderCurrency, setReminderCurrency] = useState<CurrencyCode>(currency)
  const [recurrence, setRecurrence] = useState<ReminderRecurrence>('monthly')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!isRequired(title)) newErrors.title = t('common:misc.none')
    if (!date) newErrors.date = t('common:misc.none')
    if (hasAmount && !isPositiveAmount(parseFloat(amount))) newErrors.amount = t('common:validation.required.amount')

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    addReminder({
      type,
      title: title.trim(),
      date,
      amount: hasAmount ? parseFloat(amount) : undefined,
      currency: hasAmount ? reminderCurrency : undefined,
      done: false,
      recurrence,
    })
    toast(t('common:toast.added'))
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label={t('reminders.title')}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        placeholder="Pago de tarjeta"
      />
      <Select
        label={t('reminders.type')}
        options={[
          { value: 'payment', label: t('common:actions.pay') },
          { value: 'due', label: t('common:status.upcoming') },
          { value: 'subscription', label: t('common:categories.subscriptions') },
          { value: 'savings', label: t('common:nav.savings') },
          { value: 'custom', label: t('common:misc.none') },
        ]}
        value={type}
        onChange={(e) => setType(e.target.value as ReminderType)}
      />
      <DateInput
        label={t('reminders.date')}
        value={date}
        onChange={(e) => setDate(e.target.value)}
        error={errors.date}
      />
      <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
        <input type="checkbox" checked={hasAmount} onChange={(e) => setHasAmount(e.target.checked)} className="h-4 w-4 rounded border-line text-brand-500" />
        {t('reminders.amount')}
      </label>
      {hasAmount && (
        <div className="grid grid-cols-2 gap-3">
          <CurrencyInput
            label={t('common:misc.amount')}
            currency={reminderCurrency}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={errors.amount}
            placeholder="0.00"
          />
          <Select
            label={t('common:misc.currency')}
            options={[{ value: 'USD', label: 'USD' }, { value: 'CRC', label: 'CRC' }]}
            value={reminderCurrency}
            onChange={(e) => setReminderCurrency(e.target.value as CurrencyCode)}
          />
        </div>
      )}
      <Select
        label={t('common:recurrence.recurring')}
        options={[
          { value: 'one-time', label: t('common:recurrence.none') },
          { value: 'weekly', label: t('common:recurrence.weekly') },
          { value: 'monthly', label: t('common:recurrence.monthly') },
          { value: 'yearly', label: t('common:recurrence.yearly') },
        ]}
        value={recurrence}
        onChange={(e) => setRecurrence(e.target.value as ReminderRecurrence)}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onDone}>{t('common:actions.cancel')}</Button>
        <Button type="submit">{t('common:actions.add')}</Button>
      </div>
    </form>
  )
}

interface ReminderFormModalProps {
  open: boolean
  onClose: () => void
}

export function ReminderFormModal({ open, onClose }: ReminderFormModalProps) {
  const { t } = useTranslation(['settings'])
  return (
    <Modal open={open} onClose={onClose} title={t('reminders.add')}>
      <ReminderForm onDone={onClose} />
    </Modal>
  )
}