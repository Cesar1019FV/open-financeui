# Debts

Money you owe to others (banks, family, financing). Each debt tracks installment-based repayment progress.

## Entity: `Debt`

```ts
interface Debt {
  id: string
  creditor: string                   // who you owe (bank name, person, etc.)
  totalAmount: number                // total debt in original currency
  currency: 'USD' | 'CRC'
  installmentAmount: number          // per-installment amount (0 if no fixed installments)
  installmentsTotal: number          // total number of installments (0 if flexible)
  installmentsPaid: number           // how many installments paid so far
  interestRate: number               // annual %, 0 if interest-free
  startDate: string                  // ISO date
  dueDay: number                     // day of month (1-28) installments are due
  notes?: string
}
```

## Actions

### `createDebt`

```ts
input: Omit<Debt, 'id'>
// installmentsPaid defaults to 0 on create
response: Debt
```

**Validations**: `creditor` non-empty, `totalAmount > 0`, `dueDay` 1-28, `interestRate >= 0`, `startDate` valid ISO. If `installmentsTotal > 0` then `installmentAmount > 0`.

### `updateDebt`

```ts
input: { id: string, patch: Partial<Debt> }
response: Debt
```

All fields mutable except `id`. Use this to edit creditor, amounts, interest rate, or correct installment counts.

### `deleteDebt`

```ts
input: { id: string }
response: { success: boolean }
```

Hard delete. No cascading effects.

### `payInstallment`

Custom action — records one installment payment by incrementing `installmentsPaid`.

```ts
input: { id: string }
response: Debt   // with installmentsPaid incremented
```

**Behavior**: `installmentsPaid += 1`. If `installmentsPaid === installmentsTotal` after increment, the debt is considered paid off (`isPaidOff` derived = true).

**Backend note**: this should ideally create a side-effect transaction (an expense in the debt payment category) to reflect the money leaving the account. The current UI does not do this — it only updates the debt counter. When building the backend, consider whether `payInstallment` should also create a `Transaction` via the transactions API (atomic or eventual). That's a product decision.

### `listDebts`

```ts
response: Debt[]
```

## Derived fields (computed on read)

| Field | Formula |
|---|---|
| `remainingAmount` | `totalAmount - installmentAmount * installmentsPaid` |
| `remainingInstallments` | `installmentsTotal - installmentsPaid` |
| `progress` | `installmentsPaid / installmentsTotal` (0-1) |
| `isPaidOff` | `installmentsPaid >= installmentsTotal` |
| `nextDueDate` | next date on `dueDay` of month (if today > dueDay, next month) |
| `daysUntilNextDue` | `nextDueDate - today` in days |

The backend can compute these on read or expose them as separate fields. The UI expects them available for display.

## Notes for backend

- Debts with `installmentsTotal = 0` are flexible/family loans without fixed installments — only `totalAmount` matters. `payInstallment` should be a no-op or rejected for these.
- `nextDueDate` calculation depends on current date — compute on the server using the user's timezone. The client uses the browser's local date.