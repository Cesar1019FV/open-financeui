import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PageHeader } from '@/shared/ui/PageHeader'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { SegmentedControl } from '@/shared/ui/SegmentedControl'
import { Select } from '@/shared/ui/Select'
import { useCurrency } from '@/app/providers/useCurrency'
import { useLocale } from '@/app/providers/useLocale'
import { useFinanceStore } from '@/shared/api'
import { useToast } from '@/app/providers/useToast'
import { ThemeToggle } from '@/features/theme-toggle'
import { CategoryList } from '@/features/category-manage'
import { BudgetFormModal } from '@/features/budget-set'
import { ReminderFormModal } from '@/features/reminder-schedule'
import { format, parseISO } from 'date-fns'

export function SettingsPage() {
  const { t } = useTranslation(['settings', 'common'])
  const { currency, setCurrency, rate } = useCurrency()
  const { locale, setLocale } = useLocale()
  const resetToSeed = useFinanceStore((s) => s.resetToSeed)
  const clearAll = useFinanceStore((s) => s.clearAll)
  const budgets = useFinanceStore((s) => s.budgets)
  const reminders = useFinanceStore((s) => s.reminders)
  const deleteBudget = useFinanceStore((s) => s.deleteBudget)
  const deleteReminder = useFinanceStore((s) => s.deleteReminder)
  const { toast } = useToast()

  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [showReminderForm, setShowReminderForm] = useState(false)

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} />

      <Card padded className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-ink">{t('sections.appearance')}</h2>
        <ThemeToggle />
      </Card>

      <Card padded className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-ink">{t('sections.language')}</h2>
        <Select
          options={[
            { value: 'es', label: t('language.es') },
            { value: 'en', label: t('language.en') },
          ]}
          value={locale}
          onChange={(e) => setLocale(e.target.value as 'es' | 'en')}
        />
      </Card>

      <Card padded className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-ink">{t('sections.currency')}</h2>
        <SegmentedControl
          options={[
            { value: 'USD', label: 'USD' },
            { value: 'CRC', label: 'CRC' },
          ]}
          value={currency}
          onChange={(v) => setCurrency(v as 'USD' | 'CRC')}
        />
        <p className="text-xs text-ink-muted">{t('currency.rate', { rate })}</p>
      </Card>

      <Card padded className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">{t('sections.budgets')}</h2>
          <Button size="sm" variant="secondary" iconLeft="plus" onClick={() => setShowBudgetForm(true)}>{t('budgets.add')}</Button>
        </div>
        {budgets.length === 0 ? (
          <p className="text-sm text-ink-muted py-4 text-center">{t('common:misc.none')}</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {budgets.map((b) => (
              <li key={b.id} className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2">
                <span className="flex-1 text-sm text-ink">{b.categoryId}</span>
                <span className="font-mono text-sm tabular text-ink">{b.amount} {b.currency}</span>
                <Button size="sm" variant="ghost" onClick={() => deleteBudget(b.id)}>{t('common:actions.delete')}</Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card padded className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">{t('sections.reminders')}</h2>
          <Button size="sm" variant="secondary" iconLeft="plus" onClick={() => setShowReminderForm(true)}>{t('reminders.add')}</Button>
        </div>
        {reminders.length === 0 ? (
          <p className="text-sm text-ink-muted py-4 text-center">{t('common:misc.none')}</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {reminders.slice(0, 10).map((r) => (
              <li key={r.id} className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2">
                <span className="flex-1 text-sm text-ink truncate">{r.title}</span>
                <span className="text-xs text-ink-muted">{format(parseISO(r.date), 'MMM d', { locale: undefined })}</span>
                <Button size="sm" variant="ghost" onClick={() => deleteReminder(r.id)}>{t('common:actions.delete')}</Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <CategoryList />

      <Card padded className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-ink">{t('sections.data')}</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="secondary" onClick={() => setConfirmReset(true)}>{t('data.resetSample')}</Button>
          <Button variant="danger" onClick={() => setConfirmClear(true)}>{t('data.clearAll')}</Button>
        </div>
      </Card>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title={t('data.resetSample')} size="sm">
        <p className="text-sm text-ink-muted mb-5">{t('data.resetConfirm')}</p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmReset(false)}>{t('common:actions.cancel')}</Button>
          <Button onClick={() => { resetToSeed(); toast(t('common:toast.saved')); setConfirmReset(false) }}>{t('common:actions.confirm')}</Button>
        </div>
      </Modal>

      <Modal open={confirmClear} onClose={() => setConfirmClear(false)} title={t('data.clearAll')} size="sm">
        <p className="text-sm text-ink-muted mb-5">{t('data.clearConfirm')}</p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmClear(false)}>{t('common:actions.cancel')}</Button>
          <Button variant="danger" onClick={() => { clearAll(); toast(t('common:toast.deleted')); setConfirmClear(false) }}>{t('common:actions.confirm')}</Button>
        </div>
      </Modal>

      <BudgetFormModal open={showBudgetForm} onClose={() => setShowBudgetForm(false)} />
      <ReminderFormModal open={showReminderForm} onClose={() => setShowReminderForm(false)} />
    </div>
  )
}