"""Common enumerations and constants shared across the app."""

from typing import TypeAlias

TransactionType: TypeAlias = str
TransactionKind: TypeAlias = str
CurrencyCode: TypeAlias = str
InvestmentType: TypeAlias = str
ReminderType: TypeAlias = str
ReminderRecurrence: TypeAlias = str

INCOME_KINDS: list[TransactionKind] = ["salary", "variable", "passive", "other"]
EXPENSE_KINDS: list[TransactionKind] = ["fixed", "variable", "occasional"]
TRANSACTION_KINDS: list[TransactionKind] = INCOME_KINDS + EXPENSE_KINDS

VALID_CATEGORY_TYPES: list[str] = ["income", "expense", "both"]
VALID_CURRENCIES: list[CurrencyCode] = ["USD", "CRC"]
VALID_INVESTMENT_TYPES: list[InvestmentType] = ["stock", "crypto", "fund", "bond", "commodity"]
VALID_REMINDER_TYPES: list[ReminderType] = ["payment", "due", "subscription", "savings", "custom"]
VALID_REMINDER_RECURRENCES: list[ReminderRecurrence] = ["one-time", "weekly", "monthly", "yearly"]
VALID_RECURRING_INTERVALS: list[str] = ["weekly", "monthly", "yearly"]

USD_TO_CRC_RATE = 520.0

DEFAULT_CATEGORIES: list[dict] = [
    {
        "id": "cat-salary",
        "nameKey": "common:categories.salary",
        "type": "income",
        "kind": "salary",
        "icon": "💰",
        "color": "#1f7a54",
    },
    {
        "id": "cat-rental",
        "nameKey": "common:categories.rental",
        "type": "income",
        "kind": "passive",
        "icon": "🏠",
        "color": "#34d399",
    },
    {
        "id": "cat-freelance",
        "nameKey": "common:categories.freelance",
        "type": "income",
        "kind": "variable",
        "icon": "💻",
        "color": "#2e7cb8",
    },
    {
        "id": "cat-bonus",
        "nameKey": "common:categories.bonus",
        "type": "income",
        "kind": "variable",
        "icon": "🎉",
        "color": "#c98a1a",
    },
    {
        "id": "cat-dividends",
        "nameKey": "common:categories.dividends",
        "type": "income",
        "kind": "passive",
        "icon": "📈",
        "color": "#5ece9a",
    },
    {
        "id": "cat-sales",
        "nameKey": "common:categories.sales",
        "type": "income",
        "kind": "other",
        "icon": "🏷️",
        "color": "#8fddb4",
    },
    {
        "id": "cat-gift-income",
        "nameKey": "common:categories.giftIncome",
        "type": "income",
        "kind": "other",
        "icon": "🎁",
        "color": "#6ee7b7",
    },
    {
        "id": "cat-rent",
        "nameKey": "common:categories.rent",
        "type": "expense",
        "kind": "fixed",
        "icon": "🏠",
        "color": "#c0392b",
    },
    {
        "id": "cat-utilities",
        "nameKey": "common:categories.utilities",
        "type": "expense",
        "kind": "fixed",
        "icon": "💡",
        "color": "#f59e0b",
    },
    {
        "id": "cat-water",
        "nameKey": "common:categories.water",
        "type": "expense",
        "kind": "fixed",
        "icon": "💧",
        "color": "#2e7cb8",
    },
    {
        "id": "cat-internet",
        "nameKey": "common:categories.internet",
        "type": "expense",
        "kind": "fixed",
        "icon": "🌐",
        "color": "#3b82f6",
    },
    {
        "id": "cat-subscriptions",
        "nameKey": "common:categories.subscriptions",
        "type": "expense",
        "kind": "fixed",
        "icon": "📺",
        "color": "#8b5cf6",
    },
    {
        "id": "cat-phone",
        "nameKey": "common:categories.phone",
        "type": "expense",
        "kind": "fixed",
        "icon": "📱",
        "color": "#ec4899",
    },
    {
        "id": "cat-groceries",
        "nameKey": "common:categories.groceries",
        "type": "expense",
        "kind": "variable",
        "icon": "🛒",
        "color": "#10b981",
    },
    {
        "id": "cat-transport",
        "nameKey": "common:categories.transport",
        "type": "expense",
        "kind": "variable",
        "icon": "🚗",
        "color": "#f97316",
    },
    {
        "id": "cat-restaurant",
        "nameKey": "common:categories.restaurant",
        "type": "expense",
        "kind": "variable",
        "icon": "🍽️",
        "color": "#ef4444",
    },
    {
        "id": "cat-entertainment",
        "nameKey": "common:categories.entertainment",
        "type": "expense",
        "kind": "variable",
        "icon": "🎬",
        "color": "#a855f7",
    },
    {
        "id": "cat-health",
        "nameKey": "common:categories.health",
        "type": "expense",
        "kind": "variable",
        "icon": "⚕️",
        "color": "#06b6d4",
    },
    {
        "id": "cat-clothing",
        "nameKey": "common:categories.clothing",
        "type": "expense",
        "kind": "variable",
        "icon": "👕",
        "color": "#d946ef",
    },
    {
        "id": "cat-travel",
        "nameKey": "common:categories.travel",
        "type": "expense",
        "kind": "occasional",
        "icon": "✈️",
        "color": "#0ea5e9",
    },
    {
        "id": "cat-repairs",
        "nameKey": "common:categories.repairs",
        "type": "expense",
        "kind": "occasional",
        "icon": "🔧",
        "color": "#64748b",
    },
    {
        "id": "cat-emergency",
        "nameKey": "common:categories.emergency",
        "type": "expense",
        "kind": "occasional",
        "icon": "🚨",
        "color": "#dc2626",
    },
    {
        "id": "cat-gifts",
        "nameKey": "common:categories.gifts",
        "type": "expense",
        "kind": "occasional",
        "icon": "🎁",
        "color": "#84cc16",
    },
]


def convert_amount(amount: float, from_currency: CurrencyCode, to_currency: CurrencyCode) -> float:
    if from_currency == to_currency:
        return amount
    if from_currency == "USD" and to_currency == "CRC":
        return amount * USD_TO_CRC_RATE
    return amount / USD_TO_CRC_RATE


def is_valid_hex(color: str) -> bool:
    return bool(color) and len(color) == 7 and color.startswith("#")
