import { type ReactNode, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format, parseISO } from 'date-fns'

import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { IconButton } from '@/shared/ui/IconButton'
import { Badge } from '@/shared/ui/Badge'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { DateInput } from '@/shared/ui/DateInput'
import { SegmentedControl } from '@/shared/ui/SegmentedControl'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Table, type Column } from '@/shared/ui/Table'
import { useCurrency } from '@/app/providers/useCurrency'
import { useFinanceStore, type HistoryFilters } from '@/shared/api'
import { useToast } from '@/app/providers/useToast'
import { selectCategoryById } from '@/entities/category'
import { type Transaction, type TransactionType, type TransactionKind } from '@/entities/transaction'
import { INCOME_KINDS, EXPENSE_KINDS } from '@/shared/lib/constants'
import { arrayToCsv, downloadCsv, type CsvColumn } from '@/shared/lib/csv'
import { TransactionForm } from '@/features/transaction-create'
import { DeleteTransactionDialog } from '@/features/transaction-delete'

interface TransactionHistoryTableProps {
  lockType?: TransactionType
  showFilters?: boolean
  showCsvExport?: boolean
  pageSize?: number
}

export function TransactionHistoryTable({ lockType, showFilters = true, showCsvExport = false, pageSize = 50 }: TransactionHistoryTableProps) {
  const { t } = useTranslation(['history', 'common'])
  const { currency, format: formatMoney } = useCurrency()
  const transactions = useFinanceStore((s) => s.transactions)
  const categories = useFinanceStore((s) => s.categories)
  const filters = useFinanceStore((s) => s.historyFilters)
  const setFilters = useFinanceStore((s) => s.setHistoryFilters)
  const resetFilters = useFinanceStore((s) => s.resetHistoryFilters)
  const { toast } = useToast()

  const [editing, setEditing] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState<Transaction | null>(null)
  const [showForm, setShowForm] = useState(false)

  const categoryMap = useMemo(() => selectCategoryById(categories), [categories])

  const effectiveFilters: HistoryFilters = useMemo(
    () => lockType ? { ...filters, type: lockType } : filters,
    [filters, lockType],
  )

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (lockType && tx.type !== lockType) return false
      if (effectiveFilters.type !== 'all' && tx.type !== effectiveFilters.type) return false
      if (effectiveFilters.month && !tx.date.startsWith(effectiveFilters.month)) return false
      if (effectiveFilters.categoryId !== 'all' && tx.categoryId !== effectiveFilters.categoryId) return false
      if (effectiveFilters.kind !== 'all' && tx.kind !== effectiveFilters.kind) return false
      if (effectiveFilters.search && !tx.description.toLowerCase().includes(effectiveFilters.search.toLowerCase())) return false
      return true
    })
  }, [transactions, effectiveFilters, lockType])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(effectiveFilters.page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const totals = useMemo(() => {
    let income = 0
    let expense = 0
    for (const tx of filtered) {
      const converted = tx.currency === currency ? tx.amount : tx.amount * (tx.currency === 'USD' && currency === 'CRC' ? 520 : 1 / 520)
      if (tx.type === 'income') income += converted
      else expense += converted
    }
    return { income, expense, net: income - expense }
  }, [filtered, currency])

  const columns: Column<Transaction>[] = [
    {
      key: 'date',
      header: t('table.date'),
      sortable: true,
      sortAccessor: (tx) => tx.date,
      render: (tx) => <span className="text-ink-muted">{format(parseISO(tx.date), 'MMM d, yyyy', { locale: undefined })}</span>,
    },
    {
      key: 'description',
      header: t('table.description'),
      sortable: true,
      sortAccessor: (tx) => tx.description,
      render: (tx) => <span className="text-ink">{tx.description}</span>,
    },
    {
      key: 'category',
      header: t('table.category'),
      render: (tx) => {
        const cat = categoryMap.get(tx.categoryId)
        return cat ? (
          <span className="inline-flex items-center gap-1.5 text-ink">
            <span>{cat.icon}</span>
            <span className="text-sm">{t(cat.nameKey)}</span>
          </span>
        ) : '—'
      },
    },
    {
      key: 'type',
      header: t('table.type'),
      render: (tx) => (
        <Badge variant={tx.type === 'income' ? 'positive' : 'negative'}>
          {t(`common:transactionType.${tx.type}`)}
        </Badge>
      ),
    },
    {
      key: 'amount',
      header: t('table.amount'),
      align: 'right',
      sortable: true,
      sortAccessor: (tx) => tx.amount,
      render: (tx) => (
        <span className={`font-mono tabular text-sm font-medium ${tx.type === 'income' ? 'text-positive' : 'text-negative'}`}>
          {tx.type === 'income' ? '+' : '−'}{formatMoney(tx.amount, tx.currency)}
          {tx.currency !== currency && (
            <span className="ml-1 text-xs text-ink-muted">{tx.currency}</span>
          )}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('table.actions'),
      align: 'right',
      render: (tx) => (
        <div className="inline-flex items-center gap-1">
          <IconButton icon="edit" aria-label={t('common:actions.edit')} size={16} onClick={() => setEditing(tx)} />
          <IconButton icon="trash" aria-label={t('common:actions.delete')} size={16} onClick={() => setDeleting(tx)} />
        </div>
      ),
    },
  ]

  const kindOptions = (effectiveFilters.type === 'income' ? INCOME_KINDS : effectiveFilters.type === 'expense' ? EXPENSE_KINDS : [...INCOME_KINDS, ...EXPENSE_KINDS])
    .map((k) => ({ value: k, label: t(`common:kinds.${k}`) }))

  const categoryOptions = [
    { value: 'all', label: t('filters.all') },
    ...categories.map((c) => ({ value: c.id, label: `${c.icon} ${t(c.nameKey)}` })),
  ]

  const handleExport = () => {
    const csvColumns: CsvColumn<Transaction>[] = [
      { header: 'Date', accessor: (r) => r.date },
      { header: 'Type', accessor: (r) => r.type },
      { header: 'Kind', accessor: (r) => r.kind },
      { header: 'Category', accessor: (r) => categoryMap.get(r.categoryId)?.nameKey ?? r.categoryId },
      { header: 'Description', accessor: (r) => r.description },
      { header: 'Amount', accessor: (r) => r.amount },
      { header: 'Currency', accessor: (r) => r.currency },
    ]
    const csv = arrayToCsv(filtered, csvColumns)
    const filename = t('export.filename', { date: format(new Date(), 'yyyyMM') })
    downloadCsv(filename, csv)
    toast(t('common:toast.saved'))
  }

  const emptyContent: ReactNode = (
    <EmptyState
      title={t('empty.title')}
      description={t('empty.description')}
    />
  )

  return (
    <Card padded className="flex flex-col gap-4">
      {showFilters && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <DateInput
              inputType="month"
              label={t('filters.month')}
              value={effectiveFilters.month ?? ''}
              onChange={(e) => setFilters({ month: e.target.value || null })}
            />
            {!lockType && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">{t('filters.type')}</label>
                <SegmentedControl
                  options={[
                    { value: 'all', label: t('filters.all') },
                    { value: 'income', label: t('common:transactionType.income') },
                    { value: 'expense', label: t('common:transactionType.expense') },
                  ]}
                  value={effectiveFilters.type}
                  onChange={(v) => setFilters({ type: v as HistoryFilters['type'] })}
                  size="sm"
                />
              </div>
            )}
            <Select
              label={t('filters.category')}
              options={categoryOptions}
              value={effectiveFilters.categoryId}
              onChange={(e) => setFilters({ categoryId: e.target.value })}
            />
            <Select
              label={t('filters.kind')}
              options={[{ value: 'all', label: t('filters.all') }, ...kindOptions]}
              value={effectiveFilters.kind}
              onChange={(e) => setFilters({ kind: e.target.value as TransactionKind | 'all' })}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <Input
              placeholder={t('filters.search')}
              value={effectiveFilters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="sm:max-w-xs"
            />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" iconLeft="filter" onClick={resetFilters}>{t('filters.reset')}</Button>
              {showCsvExport && (
                <Button variant="secondary" size="sm" iconLeft="external" onClick={handleExport}>{t('exportCsv')}</Button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-ink-muted font-mono tabular">
        <span>{t('summary.count', { count: filtered.length })}</span>
        <span>
          <span className="text-positive">+{formatMoney(totals.income, currency)}</span>
          {' · '}
          <span className="text-negative">−{formatMoney(totals.expense, currency)}</span>
          {' · '}
          <span className={totals.net >= 0 ? 'text-positive' : 'text-negative'}>{formatMoney(totals.net, currency)}</span>
        </span>
      </div>

      <Table
        columns={columns}
        rows={paginated}
        rowKey={(tx) => tx.id}
        stickyHeader
        emptyContent={emptyContent}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-ink-muted">{t('pagination.page', { current: currentPage, total: totalPages })}</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" iconLeft="chevron-left" disabled={currentPage <= 1} onClick={() => setFilters({ page: currentPage - 1 })}>{t('pagination.prev')}</Button>
            <Button variant="ghost" size="sm" iconRight="chevron-right" disabled={currentPage >= totalPages} onClick={() => setFilters({ page: currentPage + 1 })}>{t('pagination.next')}</Button>
          </div>
        </div>
      )}

      {showForm && (
        <TransactionForm
          onDone={() => setShowForm(false)}
        />
      )}
      {editing && (
        <TransactionFormWrapper initial={editing} onDone={() => setEditing(null)} />
      )}
      <DeleteTransactionDialog transaction={deleting} onClose={() => setDeleting(null)} />
    </Card>
  )
}

function TransactionFormWrapper({ initial, onDone }: { initial: Transaction; onDone: () => void }) {
  return <TransactionForm initial={initial} onDone={onDone} />
}