# Settings & Data Management

User preferences and data lifecycle actions. These are not CRUD entities but configuration + destructive operations.

## Settings

### Theme

```ts
type ThemeMode = 'light' | 'dark' | 'system'

// stored in localStorage key: 'finance-theme'
// 'system' follows OS prefers-color-scheme
```

**Action**: `setTheme(mode: ThemeMode)`

No backend needed — this is a client-only preference stored in `localStorage`. If user settings sync is desired later, add a `PATCH /api/user/preferences` endpoint with `theme` in the payload.

### Locale

```ts
type Locale = 'es' | 'en'

// stored in localStorage key: 'finance-locale'
```

**Action**: `setLocale(locale: Locale)`

Client-only. Changes `i18n.changeLanguage()` and updates `<html lang>`. Backend sync optional (same as theme).

### Currency

```ts
type CurrencyCode = 'USD' | 'CRC'

// stored in localStorage key: 'finance-currency'
// rate: 1 USD = 520 CRC (fixed, in shared/lib/format.ts)
```

**Action**: `setCurrency(currency: CurrencyCode)`

Client-only display preference. The backend should store all amounts in their original currency; conversion happens on read. If a live exchange rate is needed, add `GET /api/rates` returning current rates.

## Data management

### `resetToSeed`

Replaces all user data with the seeded sample data.

```ts
response: { success: boolean }
```

**Backend equivalent**: `POST /api/data/reset` — deletes all user entities and re-inserts the seed dataset. Useful for demo accounts. The backend should confirm the user wants this (the UI shows a confirmation dialog).

### `clearAll`

Deletes all user data, leaving only default categories.

```ts
response: { success: boolean }
```

**Backend equivalent**: `POST /api/data/clear` — deletes transactions, debts, loans, savingsGoals, investments, budgets, reminders. Keeps default categories (re-seeds them). The UI shows a confirmation dialog with a warning that this cannot be undone.

## Notes for backend

- Theme/locale/currency are currently client-only. To sync across devices, add a `user_preferences` table and a `PATCH /api/me/preferences` endpoint. On login, fetch preferences and apply.
- `resetToSeed` and `clearAll` are destructive. The backend should:
  1. Require explicit confirmation (the UI handles this).
  2. Consider soft-delete or a grace period (undo window) before hard-deleting.
  3. Log the action for audit.
- The seed data is defined in `shared/api/seed.ts`. The backend should have an equivalent seed dataset for new users and for the reset action.
- Default categories are always present — `clearAll` re-seeds them. The backend should enforce that a user always has the default categories available.