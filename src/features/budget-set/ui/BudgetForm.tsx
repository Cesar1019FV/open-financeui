import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { Select } from '@/shared/ui/Select'
import { CurrencyInput } from '@/shared/ui/CurrencyInput'
import { useFinanceStore } from '@/shared/api'
import { useCurrency } from '@/app/providers/useCurrency'
import { useToast } from '@/app/providers/useToast'
import { selectExpenseCategories } from '@/entities/category'
import { isPositiveAmount } from '@/shared/lib/validation'

interface BudgetFormProps {
  onDone: () => void
}

export function BudgetForm({ onDone }: BudgetFormProps) {
  const { t } = useTranslation(['settings', 'common'])
  const { currency } = useCurrency()
  const { toast } = useToast()
  const budgets = useFinanceStore((s) => s.budgets)
  const categories = useFinanceStore((s) => s.categories)
  const setBudget = useFinanceStore((s) => s.setBudget)

  const expenseCategories = selectExpenseCategories(categories)
  const available = expenseCategories.filter((c) => !budgets.some((b) => b.categoryId === c.id))

  const [categoryId, setCategoryId] = useState(available[0]?.id ?? '')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numericAmount = parseFloat(amount)
    if (!isPositiveAmount(numericAmount)) {
      setError(t('common:validation.required.amount'))
      return
    }
    if (!categoryId) return
    setBudget({ categoryId, amount: numericAmount, currency, period: 'monthly' })
    toast(t('common:toast.saved'))
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Select
        label={t('budgets.category')}
        options={available.map((c) => ({ value: c.id, label: `${c.icon} ${t(c.nameKey)}` }))}
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
      />
      <CurrencyInput
        label={t('budgets.amount')}
        currency={currency}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        error={error}
        placeholder="0.00"
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onDone}>{t('common:actions.cancel')}</Button>
        <Button type="submit">{t('common:actions.save')}</Button>
      </div>
    </form>
  )
}

interface BudgetFormModalProps {
  open: boolean
  onClose: () => void
}

export function BudgetFormModal({ open, onClose }: BudgetFormModalProps) {
  const { t } = useTranslation(['settings'])
  return (
    <Modal open={open} onClose={onClose} title={t('budgets.add')}>
      <BudgetForm onDone={onClose} />
    </Modal>
  )
}