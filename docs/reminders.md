# Reminders

Scheduled alerts for payments, due dates, subscriptions, and savings contributions. Reminders can be one-time or recurring and can link to other entities (debts, goals, budgets).

## Entity: `Reminder`

```ts
type ReminderType = 'payment' | 'due' | 'subscription' | 'savings' | 'custom'
type ReminderRecurrence = 'one-time' | 'weekly' | 'monthly' | 'yearly'

interface Reminder {
  id: string
  type: ReminderType
  title: string
  date: string                       // ISO date when the reminder fires
  amount?: number                    // optional, if the reminder involves money
  currency?: 'USD' | 'CRC'           // required if amount is set
  linkedId?: string                  // optional reference to a debt/loan/budget/goal
  done: boolean                      // whether the user marked it complete
  recurrence: ReminderRecurrence
}
```

## Actions

### `createReminder`

```ts
input: Omit<Reminder, 'id'>
// done defaults to false
response: Reminder
```

**Validations**: `title` non-empty, `date` valid ISO, `type` valid enum, `recurrence` valid enum. If `amount` is set, `currency` is required and `amount > 0`.

### `updateReminder`

```ts
input: { id: string, patch: Partial<Reminder> }
response: Reminder
```

### `deleteReminder`

```ts
input: { id: string }
response: { success: boolean }
```

### `markDone`

Custom action — marks a reminder as completed.

```ts
input: { id: string }
response: Reminder   // with done = true
```

**Behavior**: sets `done = true`. For recurring reminders, the backend may optionally generate the next occurrence (advance `date` by the recurrence interval and create a new reminder with `done = false`). The current UI does not auto-generate next occurrences — it only marks done.

### `listReminders`

```ts
input: { includeDone?: boolean, upcomingOnly?: boolean, withinDays?: number }
response: Reminder[]
```

The UI typically shows:
- **Overdue**: `done = false` and `date < today`.
- **Upcoming**: `done = false` and `date` within next 7-30 days.
- **All**: every reminder, sorted by date.

## Derived fields (computed on read)

| Field | Formula |
|---|---|
| `isOverdue` | `done = false` and `date < today` |
| `daysUntil` | `date - today` in days (negative if overdue) |
| `isUpcoming` | `done = false` and `0 <= daysUntil <= withinDays` |

## Notes for backend

- `linkedId` is a soft reference — it can point to a `Debt`, `Loan`, `SavingsGoal`, or `Budget` by ID. The backend should not enforce cascading deletes (deleting a debt does not delete its reminders). The UI handles dangling references gracefully (just shows the reminder without the linked entity).
- Recurring reminders: the current UI stores `recurrence` as metadata only — it does not auto-generate future occurrences. A backend enhancement would be to auto-create the next occurrence when `markDone` is called on a recurring reminder (compute next date by adding the interval). This is a product decision.
- The dashboard shows overdue count as a badge on the sidebar. The backend can expose a `GET /api/reminders/overdue/count` endpoint or let the client filter.
- Notifications (push/email) are not implemented. The backend could add a notification service that reads reminders due today and pushes to the user.