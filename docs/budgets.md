# Budgets

Monthly spending limits per category. The UI compares budget vs actual spent (from transactions) and shows alerts when approaching or exceeding the limit.

## Entity: `Budget`

```ts
interface Budget {
  id: string
  categoryId: string                 // references Category.id
  amount: number                     // monthly limit, > 0
  currency: 'USD' | 'CRC'
  period: 'monthly'                  // only 'monthly' supported currently
}
```

## Actions

### `setBudget`

Creates or updates a budget for a category. Only one budget per category — if a budget for `categoryId` already exists, it's updated.

```ts
input: Omit<Budget, 'id'>
response: Budget
```

**Validations**: `categoryId` must reference an expense-type category, `amount > 0`.

**Behavior**: upsert — if a budget with the same `categoryId` exists, update its `amount`/`currency`; otherwise create a new one.

### `updateBudget`

```ts
input: { id: string, patch: Partial<Budget> }
response: Budget
```

### `deleteBudget`

```ts
input: { id: string }
response: { success: boolean }
```

### `listBudgets`

```ts
response: Budget[]
```

## Derived fields (computed from transactions + budget)

These require the transactions for the current month. The UI computes them client-side; the backend can expose an aggregate endpoint.

| Field | Formula |
|---|---|
| `spent` | sum of expense transactions for `categoryId` in current month (converted to budget currency) |
| `remaining` | `amount - spent` |
| `percentUsed` | `spent / amount` (0 if amount = 0) |
| `status` | `ok` (< 80%), `warning` (80-100%), `over` (>= 100%) |

## Notes for backend

- Budgets are scoped to a category + period. Currently only `monthly` is supported. Extending to weekly/yearly would require adding a `period` field to transactions or storing budget periods separately.
- The `setBudget` action is an upsert keyed on `categoryId`. The backend should enforce one budget per category per user.
- Budget status is always relative to "current month" — the UI uses the browser's local month. The backend should accept a `yearMonth` param if historical budget tracking is needed.
- Deleting a budget does not affect transactions — it only removes the limit.