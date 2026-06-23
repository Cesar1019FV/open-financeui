import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Card } from '@/shared/ui/Card'
import { IconButton } from '@/shared/ui/IconButton'
import { EmptyState } from '@/shared/ui/EmptyState'
import { useFinanceStore } from '@/shared/api'
import { useToast } from '@/app/providers/useToast'
import type { Category } from '@/entities/category'
import { CategoryFormModal } from './CategoryForm'

export function CategoryList() {
  const { t } = useTranslation(['settings', 'common'])
  const categories = useFinanceStore((s) => s.categories)
  const transactions = useFinanceStore((s) => s.transactions)
  const deleteCategory = useFinanceStore((s) => s.deleteCategory)
  const { toast } = useToast()

  const [editing, setEditing] = useState<Category | null>(null)
  const [showForm, setShowForm] = useState(false)

  const handleDelete = (category: Category) => {
    const inUse = transactions.some((tx) => tx.categoryId === category.id)
    if (inUse) {
      toast(t('categories.inUse'), 'warning')
      return
    }
    deleteCategory(category.id)
    toast(t('common:toast.deleted'))
  }

  const sorted = [...categories].sort((a, b) => {
    if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1
    return t(a.nameKey).localeCompare(t(b.nameKey))
  })

  return (
    <Card padded className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">{t('categories.current')}</h3>
        <IconButton icon="plus" aria-label={t('categories.add')} size={16} onClick={() => setShowForm(true)} />
      </div>
      {sorted.length === 0 ? (
        <EmptyState title={t('common:misc.none')} />
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {sorted.map((cat) => (
            <li key={cat.id} className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2">
              <span className="text-lg">{cat.icon}</span>
              <span className="flex-1 text-sm text-ink truncate">{t(cat.nameKey)}</span>
              <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: cat.color }} />
              {!cat.isDefault && (
                <IconButton icon="edit" aria-label={t('common:actions.edit')} size={14} onClick={() => setEditing(cat)} />
              )}
              {!cat.isDefault && (
                <IconButton icon="trash" aria-label={t('common:actions.delete')} size={14} onClick={() => handleDelete(cat)} />
              )}
            </li>
          ))}
        </ul>
      )}

      <CategoryFormModal open={showForm} onClose={() => setShowForm(false)} />
      {editing && (
        <CategoryFormModal open={Boolean(editing)} onClose={() => setEditing(null)} initial={editing} />
      )}
    </Card>
  )
}