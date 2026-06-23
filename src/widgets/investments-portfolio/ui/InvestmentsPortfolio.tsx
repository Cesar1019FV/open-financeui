import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { IconButton } from '@/shared/ui/IconButton'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Table, type Column } from '@/shared/ui/Table'
import { useCurrency } from '@/app/providers/useCurrency'
import { useFinanceStore } from '@/shared/api'
import { amountInvested, currentValue, returnValue, returnPercent, isProfitable, investedInCurrency, currentValueInCurrency } from '@/entities/investment'
import type { Investment } from '@/entities/investment'
import { InvestmentSparkline } from '@/widgets/investment-sparkline'
import { InvestmentForm, UpdateValueDialog, DeleteInvestmentDialog } from '@/features/investment-track'

export function InvestmentsPortfolio() {
  const { t } = useTranslation(['investments', 'common'])
  const { currency, format: formatMoney } = useCurrency()
  const investments = useFinanceStore((s) => s.investments)

  const [editing, setEditing] = useState<Investment | null>(null)
  const [updating, setUpdating] = useState<Investment | null>(null)
  const [deleting, setDeleting] = useState<Investment | null>(null)

  const columns: Column<Investment>[] = [
    {
      key: 'name',
      header: t('form.name'),
      sortable: true,
      sortAccessor: (inv) => inv.name,
      render: (inv) => (
        <div className="flex flex-col">
          <span className="text-ink font-medium">{inv.name}</span>
          {inv.ticker && <span className="text-xs text-ink-muted font-mono">{inv.ticker}</span>}
        </div>
      ),
    },
    {
      key: 'type',
      header: t('form.type'),
      render: (inv) => <Badge variant="neutral">{t(`types.${inv.type}`)}</Badge>,
    },
    {
      key: 'invested',
      header: t('fields.invested'),
      align: 'right',
      sortable: true,
      sortAccessor: (inv) => amountInvested(inv),
      render: (inv) => <span className="font-mono tabular text-sm text-ink-muted">{formatMoney(investedInCurrency(inv, currency), currency)}</span>,
    },
    {
      key: 'current',
      header: t('fields.current'),
      align: 'right',
      sortable: true,
      sortAccessor: (inv) => currentValue(inv),
      render: (inv) => <span className="font-mono tabular text-sm font-semibold text-ink">{formatMoney(currentValueInCurrency(inv, currency), currency)}</span>,
    },
    {
      key: 'return',
      header: t('fields.return'),
      align: 'right',
      sortable: true,
      sortAccessor: (inv) => returnValue(inv),
      render: (inv) => {
        const profitable = isProfitable(inv)
        const pct = returnPercent(inv)
        return (
          <div className="flex flex-col items-end">
            <span className={`font-mono tabular text-sm font-medium ${profitable ? 'text-positive' : 'text-negative'}`}>
              {profitable ? '+' : ''}{formatMoney(Math.abs(returnValue(inv)), inv.currency)}
              {inv.currency !== currency && <span className="ml-1 text-xs text-ink-muted">{inv.currency}</span>}
            </span>
            <span className={`font-mono tabular text-xs ${profitable ? 'text-positive' : 'text-negative'}`}>
              {profitable ? '+' : ''}{(pct * 100).toFixed(1)}%
            </span>
          </div>
        )
      },
    },
    {
      key: 'chart',
      header: '',
      align: 'right',
      render: (inv) => <InvestmentSparkline history={inv.history} profitable={isProfitable(inv)} />,
    },
    {
      key: 'actions',
      header: t('common:misc.actions'),
      align: 'right',
      render: (inv) => (
        <div className="inline-flex items-center gap-1">
          <IconButton icon="edit" aria-label={t('common:actions.edit')} size={16} onClick={() => setEditing(inv)} />
          <IconButton icon="external" aria-label={t('common:actions.update')} size={16} onClick={() => setUpdating(inv)} />
          <IconButton icon="trash" aria-label={t('common:actions.delete')} size={16} onClick={() => setDeleting(inv)} />
        </div>
      ),
    },
  ]

  if (investments.length === 0) {
    return (
      <Card padded>
        <EmptyState title={t('empty.title')} description={t('empty.description')} />
      </Card>
    )
  }

  return (
    <Card padded className="flex flex-col gap-4">
      <Table
        columns={columns}
        rows={investments}
        rowKey={(inv) => inv.id}
        caption={t('title')}
      />

      {editing && (
        <InvestmentFormWrapper initial={editing} onDone={() => setEditing(null)} />
      )}
      <UpdateValueDialog investment={updating} onClose={() => setUpdating(null)} />
      <DeleteInvestmentDialog investment={deleting} onClose={() => setDeleting(null)} />
    </Card>
  )
}

function InvestmentFormWrapper({ initial, onDone }: { initial: Investment; onDone: () => void }) {
  return (
    <InvestmentForm initial={initial} onDone={onDone} />
  )
}