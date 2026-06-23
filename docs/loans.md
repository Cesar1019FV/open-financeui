# Loans given

Money you lent to others. Each loan tracks partial repayments and auto-derives status.

## Entity: `Loan`

```ts
type LoanStatus = 'pending' | 'partial' | 'settled'

interface LoanPayment {
  date: string                       // ISO date
  amount: number                     // in loan's currency
}

interface Loan {
  id: string
  debtor: string                     // who owes you
  amount: number                     // original amount lent
  currency: 'USD' | 'CRC'
  date: string                       // when the loan was given (ISO)
  paymentsMade: LoanPayment[]        // array of repayments
  notes?: string
}
```

## Actions

### `createLoan`

```ts
input: Omit<Loan, 'id' | 'paymentsMade'>
// paymentsMade starts as []
response: Loan
```

**Validations**: `debtor` non-empty, `amount > 0`, `date` valid ISO.

### `updateLoan`

```ts
input: { id: string, patch: Partial<Loan> }
response: Loan
```

Editable: `debtor`, `amount`, `date`, `notes`. Do not patch `paymentsMade` directly — use `registerPayment`.

### `deleteLoan`

```ts
input: { id: string }
response: { success: boolean }
```

### `registerPayment`

Custom action — records a repayment against the loan.

```ts
input: { id: string, payment: LoanPayment }
// payment = { date: string, amount: number }
response: Loan   // with payment appended to paymentsMade
```

**Validations**: `amount > 0`, `date` valid ISO, `amount` should not exceed remaining (UI allows overpayment but the backend may reject or clamp).

**Behavior**: appends to `paymentsMade`. Status auto-derives from total paid:
- `pending` — no payments made
- `partial` — some paid, remaining > 0
- `settled` — total paid >= amount

### `listLoans`

```ts
response: Loan[]
```

## Derived fields (computed on read)

| Field | Formula |
|---|---|
| `totalPaid` | sum of `paymentsMade[].amount` |
| `remaining` | `amount - totalPaid` (min 0) |
| `progress` | `totalPaid / amount` (0-1) |
| `status` | `pending` / `partial` / `settled` (see above) |

## Notes for backend

- `paymentsMade` is a sub-resource. An alternative API design is to expose `LoanPayment` as its own CRUD resource under `/api/loans/{loanId}/payments` with `POST` to add and `DELETE` to remove a payment. The current UI only supports adding payments — no edit/delete of individual payments yet.
- When `registerPayment` brings `remaining` to 0, the loan is auto-settled. The backend can either compute status on read or persist it and update on payment.
- Like debts, consider whether registering a payment should create an income transaction (money received). Not done in current UI.