import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format, parseISO } from 'date-fns'

import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { ProgressBar } from '@/shared/ui/ProgressBar'
import { IconButton } from '@/shared/ui/IconButton'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Modal } from '@/shared/ui/Modal'
import { useCurrency } from '@/app/providers/useCurrency'
import { useFinanceStore } from '@/shared/api'
import { loanRemaining, loanProgress, loanStatus, totalPaid, loanRemainingInCurrency } from '@/entities/loan'
import type { Loan, LoanStatus } from '@/entities/loan'
import { LoanForm, LoanPaymentDialog, DeleteLoanDialog } from '@/features/loan-track'

const STATUS_VARIANT: Record<LoanStatus, 'neutral' | 'warning' | 'positive'> = {
  pending: 'neutral',
  partial: 'warning',
  settled: 'positive',
}

export function LoansOverview() {
  const { t } = useTranslation(['loans', 'common'])
  const { currency, format: formatMoney } = useCurrency()
  const loans = useFinanceStore((s) => s.loans)

  const [editing, setEditing] = useState<Loan | null>(null)
  const [paying, setPaying] = useState<Loan | null>(null)
  const [deleting, setDeleting] = useState<Loan | null>(null)

  const sortedLoans = [...loans].sort((a, b) => loanProgress(b) - loanProgress(a))

  if (loans.length === 0) {
    return (
      <Card padded>
        <EmptyState title={t('empty.title')} description={t('empty.description')} />
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {sortedLoans.map((loan) => {
        const remaining = loanRemaining(loan)
        const progress = loanProgress(loan)
        const status = loanStatus(loan)
        const paid = totalPaid(loan)
        const remainingConverted = loanRemainingInCurrency(loan, currency)

        return (
          <Card key={loan.id} padded className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-ink truncate">{loan.debtor}</h3>
                <p className="text-xs text-ink-muted">{format(parseISO(loan.date), 'MMM d, yyyy', { locale: undefined })}</p>
              </div>
              <Badge variant={STATUS_VARIANT[status]}>{t(`common:status.${status}`)}</Badge>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-sm text-ink-muted">{t('fields.remaining')}</span>
              <span className="font-mono text-lg font-semibold tabular text-positive">
                {formatMoney(remainingConverted, currency)}
              </span>
            </div>

            <ProgressBar value={progress * 100} max={100} variant={progress >= 1 ? 'success' : 'default'} />

            <div className="flex items-center justify-between text-xs text-ink-muted font-mono tabular">
              <span>{t('fields.totalPaid')}: {formatMoney(paid, loan.currency)}{loan.currency !== currency ? ` ${loan.currency}` : ''}</span>
              <span>{Math.round(progress * 100)}%</span>
            </div>

            {loan.notes && <p className="text-xs text-ink-muted italic">{loan.notes}</p>}

            <div className="flex items-center justify-end gap-1 pt-2 border-t border-line">
              {remaining > 0 && (
                <IconButton icon="check" aria-label={t('registerPayment.title')} size={16} onClick={() => setPaying(loan)} />
              )}
              <IconButton icon="edit" aria-label={t('common:actions.edit')} size={16} onClick={() => setEditing(loan)} />
              <IconButton icon="trash" aria-label={t('common:actions.delete')} size={16} onClick={() => setDeleting(loan)} />
            </div>
          </Card>
        )
      })}

      {editing && (
        <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={t('form.editTitle')}>
          <LoanForm initial={editing} onDone={() => setEditing(null)} />
        </Modal>
      )}
      <LoanPaymentDialog loan={paying} onClose={() => setPaying(null)} />
      <DeleteLoanDialog loan={deleting} onClose={() => setDeleting(null)} />
    </div>
  )
}