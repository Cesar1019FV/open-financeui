import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { Modal } from '@/shared/ui/Modal'
import { useFinanceStore } from '@/shared/api'
import { CATEGORY_COLOR_PALETTE, CATEGORY_ICONS, type TransactionType, type TransactionKind } from '@/shared/lib/constants'
import { isRequired } from '@/shared/lib/validation'
import type { Category } from '@/entities/category'

interface CategoryFormProps {
  initial?: Category
  onDone: () => void
}

export function CategoryForm({ initial, onDone }: CategoryFormProps) {
  const { t } = useTranslation(['settings', 'common'])
  const addCategory = useFinanceStore((s) => s.addCategory)
  const updateCategory = useFinanceStore((s) => s.updateCategory)

  const [name, setName] = useState(initial ? t(initial.nameKey) : '')
  const [type, setType] = useState<TransactionType | 'both'>(initial?.type ?? 'expense')
  const [kind, setKind] = useState<TransactionKind>(initial?.kind ?? 'variable')
  const [icon, setIcon] = useState(initial?.icon ?? CATEGORY_ICONS[0])
  const [color, setColor] = useState(initial?.color ?? CATEGORY_COLOR_PALETTE[0])
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isRequired(name)) {
      setError(t('common:misc.none'))
      return
    }

    const payload = {
      nameKey: name,
      type,
      kind: type === 'both' ? undefined : kind,
      icon,
      color,
      custom: true,
    }

    if (initial) {
      updateCategory(initial.id, payload)
    } else {
      addCategory(payload)
    }
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label={t('categories.name')} value={name} onChange={(e) => setName(e.target.value)} error={error} placeholder="Nueva categoría" />
      <div className="grid grid-cols-2 gap-3">
        <Select
          label={t('categories.type')}
          options={[
            { value: 'income', label: t('common:transactionType.income') },
            { value: 'expense', label: t('common:transactionType.expense') },
            { value: 'both', label: `${t('common:transactionType.income')} + ${t('common:transactionType.expense')}` },
          ]}
          value={type}
          onChange={(e) => setType(e.target.value as TransactionType | 'both')}
        />
        {type !== 'both' && (
          <Select
            label={t('common:misc.type')}
            options={[
              { value: 'salary', label: t('common:kinds.salary') },
              { value: 'variable', label: t('common:kinds.variable') },
              { value: 'passive', label: t('common:kinds.passive') },
              { value: 'other', label: t('common:kinds.other') },
              { value: 'fixed', label: t('common:kinds.fixed') },
              { value: 'occasional', label: t('common:kinds.occasional') },
            ]}
            value={kind}
            onChange={(e) => setKind(e.target.value as TransactionKind)}
          />
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">{t('categories.icon')}</label>
        <div className="grid grid-cols-8 gap-1.5">
          {CATEGORY_ICONS.map((ic) => (
            <button
              key={ic}
              type="button"
              onClick={() => setIcon(ic)}
              className={`h-9 rounded-md text-lg transition-colors ${icon === ic ? 'bg-brand-100 ring-2 ring-brand-500' : 'bg-surface-2 hover:bg-line'}`}
            >
              {ic}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">{t('categories.color')}</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_COLOR_PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`h-7 w-7 rounded-full transition-transform ${color === c ? 'ring-2 ring-offset-2 ring-offset-canvas ring-ink scale-110' : ''}`}
              style={{ background: c }}
              aria-label={c}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onDone}>{t('common:actions.cancel')}</Button>
        <Button type="submit">{initial ? t('common:actions.save') : t('common:actions.add')}</Button>
      </div>
    </form>
  )
}

interface CategoryFormModalProps {
  open: boolean
  onClose: () => void
  initial?: Category
}

export function CategoryFormModal({ open, onClose, initial }: CategoryFormModalProps) {
  const { t } = useTranslation(['settings'])
  return (
    <Modal open={open} onClose={onClose} title={initial ? t('common:actions.edit') : t('categories.add')}>
      <CategoryForm initial={initial} onDone={onClose} />
    </Modal>
  )
}