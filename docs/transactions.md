# Transactions

The core entity of the app. Every movement of money in or out is a transaction. Income and expenses are the same entity differentiated by `type`.

## Entity: `Transaction`

```ts
interface Transaction {
  id: string
  type: 'income' | 'expense'
  kind: 'salary' | 'variable' | 'passive' | 'other'      // for income
      | 'fixed' | 'variable' | 'occasional'              // for expense
  categoryId: string                                     // references Category.id
  amount: number                                         // in original currency, > 0
  currency: 'USD' | 'CRC'
  date: string                                           // ISO YYYY-MM-DD
  description: string
  recurring: boolean
  recurringInterval?: 'weekly' | 'monthly' | 'yearly'    // required if recurring = true
  createdAt: string                                      // full ISO timestamp, server-set
}
```

### Kinds by type

| `type` | Valid `kind` values |
|---|---|
| `income` | `salary`, `variable`, `passive`, `other` |
| `expense` | `fixed`, `variable`, `occasional` |

The UI constrains `kind` options based on `type`. The backend should validate this invariant.

## Actions

### `createTransaction`

Adds a new transaction. Prepended to the list (most recent first by `createdAt`).

```ts
input: Omit<Transaction, 'id' | 'createdAt'>
response: Transaction   // with id + createdAt filled
```

**Validations**: `amount > 0`, `categoryId` must exist and match `type` (income category for income tx, expense category for expense tx), `date` is valid ISO, `description` non-empty, `kind` valid for `type`, if `recurring` then `recurringInterval` required.

### `updateTransaction`

Replaces any subset of fields on an existing transaction.

```ts
input: { id: string, patch: Partial<Transaction> }
response: Transaction   // updated
```

**Validations**: same as create for any provided field. `id` and `createdAt` are immutable.

### `deleteTransaction`

Permanently removes a transaction.

```ts
input: { id: string }
response: { success: boolean }
```

Deleting a transaction does not cascade — it affects recomputed totals (budgets, summaries) on next read.

### `listTransactions`

Returns all transactions, optionally filtered. Used by the History page and all summary widgets.

```ts
input: {
  month?: string         // YYYY-MM filter
  type?: 'income' | 'expense' | 'all'
  categoryId?: string | 'all'
  kind?: TransactionKind | 'all'
  search?: string        // substring match on description
  page?: number          // 1-based, default 50 per page
}
response: {
  items: Transaction[]
  total: number
  page: number
  pageSize: number
}
```

The frontend currently does client-side filtering + pagination. When backed by an API, push all filters to query params for server-side pagination.

## Derived data (computed, not stored)

These are read-only selectors that the UI computes in render. The backend can expose them as aggregate endpoints or let the client compute:

- **Monthly totals**: sum of income / expense / net for a given `YYYY-MM`.
- **Totals by kind**: sum grouped by `kind` (used by Income/Expense summary cards).
- **Totals by category**: sum grouped by `categoryId` (used by pie chart and budget tracking).
- **Last 6 months**: array of `{ yearMonth, income, expense, net }` for the comparison bar chart.

All sums convert to the display currency before aggregation.

## Notes for backend

- `categoryId` references the `Category` entity (see [categories.md](./categories.md)). Enforce referential integrity.
- When a transaction is created/updated/deleted, budgets for that category + month may change status — the client recomputes on read, no event needed.
- `recurring` is a flag only; the app does not auto-generate recurring transactions. A backend could add a cron job to materialize recurring transactions on schedule — that would be a new action `materializeRecurring` (not yet in the UI).