# Finance App — Feature Documentation

This directory documents every feature of the personal finance app. Each feature file describes the entity, its fields, and the **actions** (mutations) the UI can perform on it.

The actions are documented as **API contracts** — each action lists its inputs, behavior, and expected response — so a backend can be built by implementing each action as an endpoint. The frontend currently runs against a local Zustand store with seed data; replacing the store actions with API calls is the migration path.

## Architecture overview

```
React UI (pages/widgets)
        │
        ▼
  features/  (forms, dialogs, event handlers)
        │
        ▼
  shared/api/store.ts  (Zustand — current data layer)
        │
        ▼  [future: swap for HTTP client]
   Backend API
```

The store is the single source of truth. Every component reads via selectors and writes via store actions. When a backend is connected, store actions become thin wrappers that call the API and update local cache on success.

## Common conventions

- **IDs**: all entities use string IDs (`crypto.randomUUID()` on the client; backend should generate).
- **Currency**: every monetary field stores its original `currency` (`USD` | `CRC`). The UI converts for display using a fixed rate (`1 USD = 520 CRC`). The backend should either store amounts in a single base currency or perform conversion on read.
- **Dates**: stored as ISO strings (`YYYY-MM-DD` for dates, full ISO for `createdAt`).
- **Soft vs hard delete**: the current store does hard deletes. A backend may add soft-delete (`deletedAt`) if needed — the UI contract is unchanged.
- **Auth/user scoping**: not present yet. When adding a backend, every list/create/update/delete must be scoped to the authenticated user.

## Feature index

| Feature | Entity | File |
|---------|--------|------|
| Transactions | `Transaction` | [transactions.md](./transactions.md) |
| Categories | `Category` | [categories.md](./categories.md) |
| Debts | `Debt` | [debts.md](./debts.md) |
| Loans (money you lent) | `Loan` | [loans.md](./loans.md) |
| Savings Goals | `SavingsGoal` | [savings-goals.md](./savings-goals.md) |
| Investments | `Investment` | [investments.md](./investments.md) |
| Budgets | `Budget` | [budgets.md](./budgets.md) |
| Reminders | `Reminder` | [reminders.md](./reminders.md) |
| Account Summary (computed) | — | [account-summary.md](./account-summary.md) |
| Settings & Data | — | [settings.md](./settings.md) |

## Suggested API design

All actions map cleanly to REST conventions:

| Action pattern | HTTP method | Path |
|---|---|---|
| List | `GET` | `/api/{entity}` |
| Create | `POST` | `/api/{entity}` |
| Update | `PATCH` | `/api/{entity}/{id}` |
| Delete | `DELETE` | `/api/{entity}/{id}` |
| Custom action | `POST` | `/api/{entity}/{id}/{action}` |

Custom actions (e.g. `pay-installment`, `contribute`, `mark-done`) are documented per-feature. They are state transitions or sub-resource mutations that don't fit CRUD.

## i18n

All user-facing strings live in `shared/config/locales/{es,en}/{namespace}.ts`. The backend does not need to handle translations — the frontend resolves `nameKey` references (e.g. category names) client-side. Custom user-created entities (custom categories, goal names) store plain strings, not i18n keys.