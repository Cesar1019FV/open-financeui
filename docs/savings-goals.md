# Savings Goals

Targets you save toward (vacation, emergency fund, large purchase). Each goal tracks current progress and suggests a monthly contribution.

## Entity: `SavingsGoal`

```ts
interface SavingsGoal {
  id: string
  name: string                       // e.g. "Vacations", "Emergency fund"
  targetAmount: number               // goal target, > 0
  currency: 'USD' | 'CRC'
  currentAmount: number              // how much saved so far, >= 0
  targetDate?: string                // optional deadline (ISO)
  isEmergencyFund: boolean           // flags the emergency fund (special UI card)
  monthlyContribution: number        // planned monthly contribution, >= 0
}
```

## Actions

### `createSavingsGoal`

```ts
input: Omit<SavingsGoal, 'id'>
response: SavingsGoal
```

**Validations**: `name` non-empty, `targetAmount > 0`, `currentAmount >= 0`, `monthlyContribution >= 0`. Only one goal can have `isEmergencyFund = true` (UI convention — the backend may enforce uniqueness or allow multiple).

### `updateSavingsGoal`

```ts
input: { id: string, patch: Partial<SavingsGoal> }
response: SavingsGoal
```

Editable: all fields except `id`. Use this to rename, adjust target, change deadline, or update monthly contribution.

### `deleteSavingsGoal`

```ts
input: { id: string }
response: { success: boolean }
```

### `contribute`

Custom action — adds money to a goal (deposit into savings).

```ts
input: { id: string, amount: number }
response: SavingsGoal   // with currentAmount increased
```

**Validations**: `amount > 0`.

**Behavior**: `currentAmount += amount`. If `currentAmount >= targetAmount` after contribution, the goal is complete (`isComplete` derived = true).

### `withdraw`

Custom action — removes money from a goal (not yet in UI, but planned for backend).

```ts
input: { id: string, amount: number }
response: SavingsGoal   // with currentAmount decreased
```

**Validations**: `amount > 0`, `amount <= currentAmount` (cannot withdraw more than saved).

**Behavior**: `currentAmount -= amount`.

### `listSavingsGoals`

```ts
response: SavingsGoal[]
```

## Derived fields (computed on read)

| Field | Formula |
|---|---|
| `progress` | `currentAmount / targetAmount` (clamped 0-1) |
| `isComplete` | `currentAmount >= targetAmount` |
| `monthsRemaining` | months until `targetDate` (Infinity if no date) |
| `suggestedMonthly` | `(targetAmount - currentAmount) / monthsRemaining` (falls back to `monthlyContribution` if no date or <= 0) |

## Emergency fund

The goal with `isEmergencyFund = true` gets a special card on the Savings page showing:
- Recommended target: 3-6 months of expenses (computed from last month's total expenses × 3 and × 6).
- Current months of expenses covered: `currentAmount / lastMonthExpenses`.

The backend does not need to compute this — the client derives it from the savings goal + transaction totals. Just ensure the `isEmergencyFund` flag is queryable.

## Notes for backend

- `contribute` and `withdraw` should ideally log a transaction (expense for contribute, income for withdraw) to keep the transaction history consistent. Current UI does not do this — it only updates the goal. Product decision for backend.
- Only one `isEmergencyFund = true` goal should exist per user. Enforce on create/update.