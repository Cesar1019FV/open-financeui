const data = {
  "title": "Transaction form",
  "fields": {
    "type": "Type",
    "kind": "Kind",
    "category": "Category",
    "amount": "Amount",
    "currency": "Currency",
    "date": "Date",
    "description": "Description",
    "recurring": "Recurring",
    "interval": "Frequency"
  },
  "types": { "income": "Income", "expense": "Expense" },
  "edit": "Edit transaction",
  "add": "New transaction",
  "delete": {
    "title": "Delete transaction",
    "confirm": "This transaction will be removed from history. This cannot be undone."
  },
  "required": {
    "amount": "Amount must be greater than 0.",
    "category": "Select a category.",
    "description": "Add a description.",
    "date": "Select a valid date."
  }
}
export default data

