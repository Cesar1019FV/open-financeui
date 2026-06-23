import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'

import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { ProgressBar } from '@/shared/ui/ProgressBar'
import { IconButton } from '@/shared/ui/IconButton'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Modal } from '@/shared/ui/Modal'
import { useCurrency } from '@/app/providers/useCurrency'
import { useFinanceStore } from '@/shared/api'
import { remainingInstallments, debtProgress, isPaidOff, nextDueDate, daysUntilNextDue, remainingInCurrency } from '@/entities/debt'
import type { Debt } from '@/entities/debt'
import { DebtForm, InstallmentPaymentDialog, DeleteDebtDialog } from '@/features/debt-track'

export function DebtsOverview() {
  const { t } = useTranslation(['debts', 'common'])
  const { currency, format: formatMoney } = useCurrency()
  const debts = useFinanceStore((s) => s.debts)

  const [editing, setEditing] = useState<Debt | null>(null)
  const [paying, setPaying] = useState<Debt | null>(null)
  const [deleting, setDeleting] = useState<Debt | null>(null)

  const sortedDebts = [...debts].sort((a, b) => debtProgress(b) - debtProgress(a))

  if (debts.length === 0) {
    return (
      <Card padded>
        <EmptyState title={t('empty.title')} description={t('empty.description')} />
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {sortedDebts.map((debt) => {
        const remainingInstallmentsCount = remainingInstallments(debt)
        const progress = debtProgress(debt)
        const paid = isPaidOff(debt)
        const nextDue = nextDueDate(debt)
        const daysUntil = daysUntilNextDue(debt)
        const remainingConverted = remainingInCurrency(debt, currency)

        return (
          <Card key={debt.id} padded className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-ink truncate">{debt.creditor}</h3>
                <p className="text-xs text-ink-muted">
                  {debt.installmentsTotal > 0
                    ? `${debt.installmentsPaid} / ${debt.installmentsTotal} ${t('common:units.installments').toLowerCase()}`
                    : t('common:units.total')}
                </p>
              </div>
              {paid ? (
                <Badge variant="positive">{t('fields.paidOff')}</Badge>
              ) : daysUntil < 0 ? (
                <Badge variant="negative">{t('common:status.overdue')}</Badge>
              ) : daysUntil <= 7 ? (
                <Badge variant="warning">{t('common:status.upcoming')}</Badge>
              ) : null}
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-sm text-ink-muted">{t('fields.remaining')}</span>
              <span className="font-mono text-lg font-semibold tabular text-negative">
                {formatMoney(remainingConverted, currency)}
              </span>
            </div>

            {debt.installmentsTotal > 0 && (
              <>
                <ProgressBar value={progress * 100} max={100} variant={progress >= 1 ? 'success' : 'default'} />
                <div className="flex items-center justify-between text-xs text-ink-muted">
                  <span>{Math.round(progress * 100)}%</span>
                  {!paid && remainingInstallmentsCount > 0 && (
                    <span>{t('fields.installmentsLeft', { n: remainingInstallmentsCount })}</span>
                  )}
                </div>
              </>
            )}

            {!paid && debt.installmentsTotal > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-muted">{t('fields.nextDue')}</span>
                <span className="text-ink font-medium">{format(nextDue, 'MMM d, yyyy', { locale: undefined })}</span>
              </div>
            )}

            {debt.interestRate > 0 && (
              <p className="text-xs text-ink-muted">
                {t('form.interestRate')}: {debt.interestRate}% · {t('common:misc.amount')}: {formatMoney(debt.installmentAmount, debt.currency)}
                {debt.currency !== currency && <span className="ml-1 text-ink-muted">{debt.currency}</span>}
              </p>
            )}

            <div className="flex items-center justify-end gap-1 pt-2 border-t border-line">
              {!paid && debt.installmentsTotal > 0 && (
                <IconButton icon="check" aria-label={t('common:actions.pay')} size={16} onClick={() => setPaying(debt)} />
              )}
              <IconButton icon="edit" aria-label={t('common:actions.edit')} size={16} onClick={() => setEditing(debt)} />
              <IconButton icon="trash" aria-label={t('common:actions.delete')} size={16} onClick={() => setDeleting(debt)} />
            </div>
          </Card>
        )
      })}

      {editing && (
        <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={t('form.editTitle')}>
          <DebtForm initial={editing} onDone={() => setEditing(null)} />
        </Modal>
      )}
      <InstallmentPaymentDialog debt={paying} onClose={() => setPaying(null)} />
      <DeleteDebtDialog debt={deleting} onClose={() => setDeleting(null)} />
    </div>
  )
}