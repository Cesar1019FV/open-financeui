# Account Summary (computed)

Read-only aggregates derived from transactions, debts, loans, savings goals, and investments. Not a stored entity — the UI computes these in render via pure selectors.

The backend can expose these as aggregate endpoints to avoid the client fetching all entities and computing locally.

## Endpoints (suggested)

### `GET /api/summary/monthly?yearMonth=YYYY-MM&currency=USD`

Returns the monthly summary for a given month.

```ts
response: {
  totalIncome: number
  totalExpense: number
  net: number
  byCategory: Array<{ categoryId: string, income: number, expense: number }>
  byKind: Record<TransactionKind, number>
  vsPrevious: {
    incomeDelta: number
    expenseDelta: number
    netDelta: number
  }
}
```

**Computation**:
- Filter transactions by `yearMonth`.
- Sum income / expense (converting each to the target currency).
- Group by `categoryId` and `kind`.
- Fetch previous month's totals and compute deltas.

Used by: Dashboard hero, KPI cards, Balance page.

### `GET /api/summary/last-6-months?currency=USD`

Returns 6 data points for the comparison bar chart.

```ts
response: Array<{
  yearMonth: string
  income: number
  expense: number
  net: number
}>
```

Used by: Monthly comparison bar chart (Dashboard, Balance).

### `GET /api/summary/category-breakdown?yearMonth=YYYY-MM&currency=USD`

Returns expense breakdown by category for a month.

```ts
response: Array<{
  categoryId: string
  amount: number
  percent: number        // share of total expenses (0-1)
}>
```

Sorted by amount descending. Used by: Pie chart (Dashboard, Expenses, Balance).

### `GET /api/summary/net-worth?currency=USD`

Returns the user's net worth across all entities.

```ts
response: {
  savings: number        // sum of all savingsGoals.currentAmount
  investments: number    // sum of all investments.currentValue
  receivable: number     // sum of all loans.remaining
  debts: number          // sum of all debts.remainingAmount
  total: number          // savings + investments + receivable - debts
}
```

Used by: Net worth card (Dashboard).

## Notes for backend

- All amounts are converted to the requested `currency` before aggregation. The conversion rate is currently fixed (`1 USD = 520 CRC`). The backend should use a configurable or live exchange rate.
- These endpoints are pure reads — no caching invalidation needed beyond standard query caching. If any underlying entity changes, the next read reflects it.
- For performance with large datasets, these aggregates should be precomputed (materialized views) rather than computed on every request. Consider a cron job that updates monthly summaries nightly.
- The `vsPrevious` delta requires fetching the previous month's summary too — either query both months or store a rolling delta.