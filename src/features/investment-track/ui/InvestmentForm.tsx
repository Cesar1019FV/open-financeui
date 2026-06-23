import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { CurrencyInput } from '@/shared/ui/CurrencyInput'
import { DateInput } from '@/shared/ui/DateInput'
import { useFinanceStore } from '@/shared/api'
import { useCurrency } from '@/app/providers/useCurrency'
import { useToast } from '@/app/providers/useToast'
import { formatISODate } from '@/entities/transaction'
import { INVESTMENT_TYPES, type CurrencyCode, type InvestmentType } from '@/shared/lib/constants'
import { isPositiveAmount, isRequired } from '@/shared/lib/validation'
import type { Investment } from '@/entities/investment'

interface InvestmentFormProps {
  initial?: Investment
  onDone: () => void
}

export function InvestmentForm({ initial, onDone }: InvestmentFormProps) {
  const { t } = useTranslation(['investments', 'common'])
  const { currency } = useCurrency()
  const { toast } = useToast()
  const addInvestment = useFinanceStore((s) => s.addInvestment)
  const updateInvestment = useFinanceStore((s) => s.updateInvestment)

  const [name, setName] = useState(initial?.name ?? '')
  const [type, setType] = useState<InvestmentType>(initial?.type ?? 'stock')
  const [ticker, setTicker] = useState(initial?.ticker ?? '')
  const [units, setUnits] = useState(initial ? String(initial.units) : '')
  const [purchasePrice, setPurchasePrice] = useState(initial ? String(initial.purchasePrice) : '')
  const [currentPrice, setCurrentPrice] = useState(initial ? String(initial.currentPrice) : '')
  const [purchaseDate, setPurchaseDate] = useState(initial?.purchaseDate ?? formatISODate(new Date()))
  const [invCurrency, setInvCurrency] = useState<CurrencyCode>(initial?.currency ?? currency)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!isRequired(name)) newErrors.name = t('common:misc.none')
    if (!isPositiveAmount(parseFloat(units))) newErrors.units = t('common:misc.none')
    if (!isPositiveAmount(parseFloat(purchasePrice))) newErrors.purchasePrice = t('common:validation.required.amount')
    if (!isPositiveAmount(parseFloat(currentPrice))) newErrors.currentPrice = t('common:validation.required.amount')

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const payload = {
      name: name.trim(),
      type,
      ticker: ticker.trim() || undefined,
      units: parseFloat(units),
      purchasePrice: parseFloat(purchasePrice),
      currentPrice: parseFloat(currentPrice),
      purchaseDate,
      currency: invCurrency,
      history: initial?.history ?? [parseFloat(purchasePrice), parseFloat(currentPrice)],
    }

    if (initial) {
      updateInvestment(initial.id, payload)
      toast(t('common:toast.updated'))
    } else {
      addInvestment(payload)
      toast(t('common:toast.added'))
    }
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label={t('form.name')} value={name} onChange={(e) => setName(e.target.value)} error={errors.name} placeholder="Apple" />
      <div className="grid grid-cols-2 gap-3">
        <Select label={t('form.type')} options={INVESTMENT_TYPES.map((tp) => ({ value: tp, label: t(`types.${tp}`) }))} value={type} onChange={(e) => setType(e.target.value as InvestmentType)} />
        <Input label={t('form.ticker')} value={ticker} onChange={(e) => setTicker(e.target.value)} placeholder="AAPL" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Input label={t('form.units')} type="number" step="any" value={units} onChange={(e) => setUnits(e.target.value)} error={errors.units} placeholder="10" />
        <CurrencyInput label={t('form.purchasePrice')} currency={invCurrency} value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} error={errors.purchasePrice} placeholder="0.00" />
        <CurrencyInput label={t('form.currentPrice')} currency={invCurrency} value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} error={errors.currentPrice} placeholder="0.00" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <DateInput label={t('form.purchaseDate')} value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
        <Select label={t('common:misc.currency')} options={[{ value: 'USD', label: 'USD' }, { value: 'CRC', label: 'CRC' }]} value={invCurrency} onChange={(e) => setInvCurrency(e.target.value as CurrencyCode)} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onDone}>{t('common:actions.cancel')}</Button>
        <Button type="submit">{initial ? t('common:actions.save') : t('common:actions.add')}</Button>
      </div>
    </form>
  )
}