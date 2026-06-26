# API Reference

Base URL for local development: `http://localhost:8000`

All payloads and responses are JSON. Field names are in `camelCase` to match the React frontend.

## Categories

### `GET /api/v1/categories`

List all categories for the authenticated user.

Response:

```json
[
  {
    "id": "...",
    "nameKey": "common:categories.salary",
    "type": "income",
    "kind": "salary",
    "icon": "💰",
    "color": "#1f7a54",
    "custom": false,
    "isDefault": true
  }
]
```

### `POST /api/v1/categories`

Create a custom category.

Request:

```json
{
  "nameKey": "My category",
  "type": "expense",
  "kind": "variable",
  "icon": "🏷️",
  "color": "#3b82f6"
}
```

## Transactions

### `GET /api/v1/transactions`

List transactions ordered by date descending.

### `POST /api/v1/transactions`

Create a transaction. `description` and `kind` are optional; `kind` defaults to `variable`.

Request:

```json
{
  "type": "income",
  "categoryId": "...",
  "amount": 1000,
  "currency": "USD",
  "date": "2024-06-25",
  "description": "Paycheck"
}
```

Response includes `id`, `createdAt`, `recurring`, etc.

### `GET /api/v1/transactions/{id}`

Get a single transaction.

### `PATCH /api/v1/transactions/{id}`

Partial update. Send only the fields you want to change.

### `DELETE /api/v1/transactions/{id}`

Delete a transaction. Returns `204 No Content`.

## Debts

### `POST /api/v1/debts`

Request:

```json
{
  "creditor": "Bank A",
  "totalAmount": 3000,
  "currency": "USD",
  "installmentAmount": 250,
  "installmentsTotal": 12,
  "installmentsPaid": 4,
  "interestRate": 24,
  "startDate": "2024-01-15",
  "dueDay": 15,
  "notes": "Credit card debt"
}
```

## Loans

### `POST /api/v1/loans`

Request:

```json
{
  "debtor": "Mike",
  "amount": 200,
  "currency": "USD",
  "date": "2024-03-15",
  "notes": "Emergency loan"
}
```

Loans expose `paymentsMade` as a list of payments.

## Savings Goals

### `POST /api/v1/savings-goals`

Request:

```json
{
  "name": "Vacations",
  "targetAmount": 3000,
  "currency": "USD",
  "currentAmount": 1800,
  "targetDate": "2025-06-01",
  "isEmergencyFund": false,
  "monthlyContribution": 300
}
```

### `POST /api/v1/savings-goals/{id}/contribute`

```json
{ "amount": 100 }
```

### `POST /api/v1/savings-goals/{id}/withdraw`

```json
{ "amount": 50 }
```

## Investments

### `POST /api/v1/investments`

Request:

```json
{
  "name": "Apple",
  "type": "stock",
  "ticker": "AAPL",
  "units": 10,
  "purchasePrice": 150,
  "currentPrice": 175,
  "purchaseDate": "2023-06-01",
  "currency": "USD"
}
```

Investments expose `history` as an array of prices.

### `POST /api/v1/investments/{id}/update-value`

```json
{ "currentPrice": 180 }
```

## Budgets

### `POST /api/v1/budgets`

```json
{
  "categoryId": "...",
  "amount": 400,
  "currency": "USD",
  "period": "monthly"
}
```

## Reminders

### `POST /api/v1/reminders`

```json
{
  "type": "payment",
  "title": "Rent",
  "date": "2024-07-01",
  "amount": 900,
  "currency": "USD",
  "recurrence": "monthly",
  "done": false
}
```

## Summary

### `GET /api/v1/summary/monthly?year_month=2024-06`

Returns income, expense and balance for a given month.

### `GET /api/v1/summary/net-worth?currency=USD`

Returns net worth breakdown from savings, investments and debts.

## Data management

### `POST /api/v1/data/reset`

Clear all user data and re-seed with demo transactions, debts, loans, goals, investments, budgets and reminders.

### `POST /api/v1/data/clear`

Clear all user data while keeping the account and default categories.

## Errors

The API uses standard HTTP status codes:

- `200 OK` — success
- `201 Created` — resource created
- `204 No Content` — deleted successfully
- `400 Bad Request` — validation error (see response body)
- `401 Unauthorized` — missing or invalid token
- `404 Not Found` — resource does not exist
- `409 Conflict` — duplicate email on register
- `422 Unprocessable Entity` — Pydantic validation error

Example validation error:

```json
{
  "detail": [
    {
      "loc": ["body", "amount"],
      "msg": "Input should be greater than 0",
      "type": "greater_than"
    }
  ]
}
```
