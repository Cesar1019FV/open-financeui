"""Seed service: creates default categories and demo user data."""

from datetime import UTC, datetime
from typing import Any

from sqlalchemy.orm import Session

from app.core.constants import DEFAULT_CATEGORIES
from app.models import (
    Budget,
    Category,
    Debt,
    Investment,
    InvestmentHistory,
    Loan,
    LoanPayment,
    Reminder,
    SavingsGoal,
    Transaction,
)
from app.models.user import User


def create_default_categories(db: Session, user: User) -> list[Category]:
    categories: list[Category] = []
    for cat in DEFAULT_CATEGORIES:
        category = Category(
            name_key=cat["nameKey"],
            type=cat["type"],
            kind=cat.get("kind"),
            icon=cat["icon"],
            color=cat["color"],
            custom=False,
            is_default=True,
            user_id=user.id,
        )
        db.add(category)
        categories.append(category)
    return categories


def _iso(year: int, month: int, day: int) -> str:
    return f"{year}-{month:02d}-{day:02d}"


def _current_year_month() -> dict:
    now = datetime.now(UTC)
    prev = datetime(now.year, now.month - 1, 1)
    two_ago = datetime(now.year, now.month - 2, 1)
    return {
        "year": now.year,
        "month": now.month,
        "prev_year": prev.year,
        "prev_month": prev.month,
        "two_year": two_ago.year,
        "two_month": two_ago.month,
    }


def seed_demo_data(db: Session, user: User) -> None:
    c = _current_year_month()

    category_map = {cat.name_key.split(":")[-1]: cat for cat in user.categories}

    def cat_id(name_key_suffix: str) -> str:
        return category_map[f"categories.{name_key_suffix}"].id

    transactions: list[dict[str, Any]] = []

    def add_income(
        tx_id: str,
        suffix: str,
        kind: str,
        amount: float,
        currency: str,
        year: int,
        month: int,
        day: int,
        description: str,
    ) -> None:
        transactions.append(
            {
                "id": f"tx-{tx_id}",
                "type": "income",
                "kind": kind,
                "category_id": cat_id(suffix),
                "amount": amount,
                "currency": currency,
                "date": _iso(year, month, day),
                "description": description,
                "recurring": False,
                "user_id": user.id,
            }
        )

    def add_expense(
        tx_id: str,
        suffix: str,
        kind: str,
        amount: float,
        currency: str,
        year: int,
        month: int,
        day: int,
        description: str,
    ) -> None:
        transactions.append(
            {
                "id": f"tx-{tx_id}",
                "type": "expense",
                "kind": kind,
                "category_id": cat_id(suffix),
                "amount": amount,
                "currency": currency,
                "date": _iso(year, month, day),
                "description": description,
                "recurring": False,
                "user_id": user.id,
            }
        )

    for suffix in ["salary", "rental"]:
        amount = 2500 if suffix == "salary" else 400
        kind = "salary" if suffix == "salary" else "passive"
        for year, month in [
            (c["two_year"], c["two_month"]),
            (c["prev_year"], c["prev_month"]),
            (c["year"], c["month"]),
        ]:
            transactions.append(
                {
                    "id": f"tx-inc-{suffix}-{year}-{month}",
                    "type": "income",
                    "kind": kind,
                    "category_id": cat_id(suffix),
                    "amount": amount,
                    "currency": "USD",
                    "date": _iso(year, month, 1),
                    "description": f"Ingreso recurrente {suffix}",
                    "recurring": True,
                    "recurring_interval": "monthly",
                    "user_id": user.id,
                }
            )

    add_income(
        "freelance-1", "freelance", "variable", 800, "USD", c["year"], c["month"], 5, "Proyecto A"
    )
    add_income(
        "freelance-2",
        "freelance",
        "variable",
        1200,
        "USD",
        c["prev_year"],
        c["prev_month"],
        12,
        "Proyecto B",
    )
    add_income(
        "freelance-3",
        "freelance",
        "variable",
        450,
        "USD",
        c["two_year"],
        c["two_month"],
        18,
        "Consultoría",
    )
    add_income(
        "bonus-1", "bonus", "variable", 500, "USD", c["prev_year"], c["prev_month"], 20, "Bono"
    )
    add_income(
        "dividends-1", "dividends", "passive", 120, "USD", c["year"], c["month"], 8, "Dividendos Q1"
    )
    add_income(
        "dividends-2",
        "dividends",
        "passive",
        95,
        "USD",
        c["two_year"],
        c["two_month"],
        8,
        "Dividendos Q4",
    )
    add_income(
        "sales-1", "sales", "other", 300, "USD", c["prev_year"], c["prev_month"], 22, "Venta laptop"
    )
    add_income(
        "gift-1", "giftIncome", "other", 50, "USD", c["two_year"], c["two_month"], 25, "Regalo"
    )

    recurring_expenses = [
        ("rent", "rent", "fixed", 900, "USD", "Alquiler", 1),
        ("electricity", "utilities", "fixed", 18000, "CRC", "Electricidad", 10),
        ("water", "water", "fixed", 8000, "CRC", "Agua", 10),
        ("internet", "internet", "fixed", 40, "USD", "Internet", 10),
        ("spotify", "subscriptions", "fixed", 9.99, "USD", "Spotify", 15),
        ("netflix", "subscriptions", "fixed", 15.99, "USD", "Netflix", 15),
        ("icloud", "subscriptions", "fixed", 2.99, "USD", "iCloud", 15),
        ("phone", "phone", "fixed", 25, "USD", "Teléfono", 20),
    ]
    for exp_id, suffix, kind, amount, currency, description, day in recurring_expenses:
        for year, month in [
            (c["two_year"], c["two_month"]),
            (c["prev_year"], c["prev_month"]),
            (c["year"], c["month"]),
        ]:
            transactions.append(
                {
                    "id": f"tx-{exp_id}-{year}-{month}",
                    "type": "expense",
                    "kind": kind,
                    "category_id": cat_id(suffix),
                    "amount": amount,
                    "currency": currency,
                    "date": _iso(year, month, day),
                    "description": description,
                    "recurring": True,
                    "recurring_interval": "monthly",
                    "user_id": user.id,
                }
            )

    for i, (year, month) in enumerate(
        [
            (c["two_year"], c["two_month"]),
            (c["prev_year"], c["prev_month"]),
            (c["year"], c["month"]),
        ]
    ):
        for w in range(4):
            add_expense(
                f"grocery-{i}-{w}",
                "groceries",
                "variable",
                85 + w * 10,
                "USD",
                year,
                month,
                3 + w * 7,
                f"Supermercado semana {w + 1}",
            )
    for id, day, amount in [
        ("grocery-c-1", 3, 95),
        ("grocery-c-2", 10, 110),
        ("grocery-c-3", 17, 88),
    ]:
        add_expense(
            id, "groceries", "variable", amount, "USD", c["year"], c["month"], day, "Supermercado"
        )

    add_expense("gas-1", "transport", "variable", 40, "USD", c["year"], c["month"], 6, "Gasolina")
    add_expense("gas-2", "transport", "variable", 45, "USD", c["year"], c["month"], 20, "Gasolina")
    add_expense(
        "gas-3", "transport", "variable", 38, "USD", c["prev_year"], c["prev_month"], 6, "Gasolina"
    )

    add_expense(
        "restaurant-1", "restaurant", "variable", 35, "USD", c["year"], c["month"], 7, "Cena amigos"
    )
    add_expense(
        "restaurant-2",
        "restaurant",
        "variable",
        60,
        "USD",
        c["prev_year"],
        c["prev_month"],
        14,
        "Celebración",
    )
    add_expense(
        "restaurant-3",
        "restaurant",
        "variable",
        28,
        "USD",
        c["two_year"],
        c["two_month"],
        9,
        "Desayuno",
    )
    add_expense(
        "restaurant-4",
        "restaurant",
        "variable",
        45,
        "USD",
        c["year"],
        c["month"],
        18,
        "Cena pareja",
    )

    add_expense(
        "cinema-1", "entertainment", "variable", 18, "USD", c["year"], c["month"], 12, "Cine"
    )
    add_expense(
        "cinema-2",
        "entertainment",
        "variable",
        24,
        "USD",
        c["prev_year"],
        c["prev_month"],
        16,
        "Cine 3D",
    )
    add_expense(
        "pharmacy-1", "health", "variable", 12000, "CRC", c["year"], c["month"], 9, "Farmacia"
    )
    add_expense(
        "pharmacy-2",
        "health",
        "variable",
        22,
        "USD",
        c["prev_year"],
        c["prev_month"],
        11,
        "Vitaminas",
    )
    add_expense(
        "clothes-1", "clothing", "variable", 65, "USD", c["two_year"], c["two_month"], 14, "Ropa"
    )
    add_expense(
        "clothes-2",
        "clothing",
        "variable",
        120,
        "USD",
        c["prev_year"],
        c["prev_month"],
        23,
        "Chaquetas",
    )
    add_expense("flight-1", "travel", "occasional", 350, "USD", c["year"], c["month"], 2, "Vuelo")
    add_expense(
        "repair-1",
        "repairs",
        "occasional",
        180,
        "USD",
        c["prev_year"],
        c["prev_month"],
        19,
        "Reparación",
    )
    add_expense(
        "dental-1",
        "emergency",
        "occasional",
        90,
        "USD",
        c["two_year"],
        c["two_month"],
        21,
        "Urgencia dental",
    )
    add_expense("gift-2", "gifts", "occasional", 30, "USD", c["year"], c["month"], 14, "Regalo")

    for tx in transactions:
        db.add(Transaction(**tx))

    debts = [
        Debt(
            creditor="Tarjeta de crédito Banco A",
            total_amount=3000,
            currency="USD",
            installment_amount=250,
            installments_total=12,
            installments_paid=4,
            interest_rate=24,
            start_date=_iso(c["year"], c["month"] - 4 if c["month"] > 4 else c["month"] + 8, 15),
            due_day=15,
            user_id=user.id,
        ),
        Debt(
            creditor="Préstamo personal Banco B",
            total_amount=5000,
            currency="USD",
            installment_amount=220,
            installments_total=24,
            installments_paid=8,
            interest_rate=18,
            start_date=_iso(c["year"], c["month"] - 8 if c["month"] > 8 else c["month"] + 4, 5),
            due_day=5,
            user_id=user.id,
        ),
        Debt(
            creditor="Financiamiento auto",
            total_amount=15000,
            currency="USD",
            installment_amount=330,
            installments_total=48,
            installments_paid=14,
            interest_rate=8,
            start_date=_iso(c["year"] - 1, c["month"], 10),
            due_day=10,
            user_id=user.id,
        ),
        Debt(
            creditor="Financiamiento muebles",
            total_amount=1200,
            currency="USD",
            installment_amount=120,
            installments_total=10,
            installments_paid=6,
            interest_rate=0,
            start_date=_iso(c["year"], c["month"] - 6 if c["month"] > 6 else c["month"] + 6, 20),
            due_day=20,
            user_id=user.id,
        ),
        Debt(
            creditor="Préstamo familiar",
            total_amount=2000,
            currency="USD",
            installment_amount=0,
            installments_total=0,
            installments_paid=0,
            interest_rate=0,
            start_date=_iso(c["year"] - 1, c["month"], 1),
            due_day=1,
            notes="Pago flexible",
            user_id=user.id,
        ),
        Debt(
            creditor="Financiamiento equipo",
            total_amount=800,
            currency="USD",
            installment_amount=100,
            installments_total=8,
            installments_paid=3,
            interest_rate=12,
            start_date=_iso(c["year"], c["month"] - 3 if c["month"] > 3 else c["month"] + 9, 28),
            due_day=28,
            user_id=user.id,
        ),
    ]
    db.add_all(debts)

    loans = [
        Loan(
            debtor="Mike",
            amount=200,
            currency="USD",
            date=_iso(c["year"], 3, 15),
            notes="Préstamo emergencia",
            user_id=user.id,
        ),
        Loan(
            debtor="Ana",
            amount=50000,
            currency="CRC",
            date=_iso(c["year"], 2, 1),
            user_id=user.id,
            payments=[LoanPayment(date=_iso(c["year"], 3, 1), amount=20000)],
        ),
        Loan(
            debtor="Carlos",
            amount=500,
            currency="USD",
            date=_iso(c["year"], 1, 10),
            user_id=user.id,
            payments=[
                LoanPayment(date=_iso(c["year"], 1, 25), amount=250),
                LoanPayment(date=_iso(c["year"], 2, 10), amount=250),
            ],
        ),
        Loan(
            debtor="Luis",
            amount=150,
            currency="USD",
            date=_iso(c["year"], 3, 20),
            user_id=user.id,
        ),
    ]
    db.add_all(loans)

    goals = [
        SavingsGoal(
            name="Vacaciones",
            target_amount=3000,
            currency="USD",
            current_amount=1800,
            target_date=_iso(c["year"] + 1, 6, 1),
            is_emergency_fund=False,
            monthly_contribution=300,
            user_id=user.id,
        ),
        SavingsGoal(
            name="Fondo de emergencia",
            target_amount=15000,
            currency="USD",
            current_amount=9000,
            is_emergency_fund=True,
            monthly_contribution=500,
            user_id=user.id,
        ),
        SavingsGoal(
            name="Laptop nueva",
            target_amount=2000,
            currency="USD",
            current_amount=1200,
            target_date=_iso(
                c["year"], c["month"] + 3 if c["month"] + 3 <= 12 else c["month"] + 3 - 12, 1
            ),
            is_emergency_fund=False,
            monthly_contribution=200,
            user_id=user.id,
        ),
        SavingsGoal(
            name="Auto nuevo",
            target_amount=20000,
            currency="USD",
            current_amount=4000,
            target_date=_iso(c["year"] + 2, 1, 1),
            is_emergency_fund=False,
            monthly_contribution=400,
            user_id=user.id,
        ),
        SavingsGoal(
            name="Navidad",
            target_amount=1000,
            currency="USD",
            current_amount=300,
            target_date=_iso(c["year"], 12, 1),
            is_emergency_fund=False,
            monthly_contribution=100,
            user_id=user.id,
        ),
    ]
    db.add_all(goals)

    def gen_history(start: float, end: float, points: int) -> list[float]:
        result: list[float] = []
        step = (end - start) / points
        current = start
        for i in range(points):
            noise = (0.4 * step) * (0.7 * (i % 2) + 0.3 * ((i + 1) % 2))
            result.append(max(0.0, current + noise))
            current += step
        result[-1] = end
        return result

    investment_defs = [
        ("inv-aapl", "Apple", "stock", "AAPL", 10, 150, 175, c["year"] - 1, 6),
        ("inv-msft", "Microsoft", "stock", "MSFT", 5, 300, 380, c["year"] - 1, 3),
        ("inv-btc", "Bitcoin", "crypto", "BTC", 0.05, 40000, 52000, c["year"] - 1, 9),
        ("inv-eth", "Ethereum", "crypto", "ETH", 1.5, 2500, 2800, c["year"] - 1, 10),
        ("inv-vti", "VTI ETF", "fund", "VTI", 8, 240, 265, c["year"] - 2, 1),
        ("inv-sp500", "S&P 500 Fund", "fund", None, 12, 400, 435, c["year"] - 2, 5),
        ("inv-bond", "Local Bond", "bond", None, 1, 5000, 5125, c["year"] - 1, 1),
        ("inv-gold", "Gold", "commodity", None, 3, 1900, 2050, c["year"] - 1, 4),
    ]
    for id, name, type_, ticker, units, purchase, current, year, month in investment_defs:
        inv = Investment(
            id=id,
            name=name,
            type=type_,
            ticker=ticker,
            units=units,
            purchase_price=purchase,
            current_price=current,
            purchase_date=_iso(year, month, 1),
            currency="USD",
            user_id=user.id,
        )
        for seq, price in enumerate(gen_history(purchase, current, 30)):
            inv.history_points.append(InvestmentHistory(sequence=seq, price=price))
        db.add(inv)

    budgets = [
        Budget(category_id=cat_id("groceries"), amount=400, currency="USD", user_id=user.id),
        Budget(category_id=cat_id("transport"), amount=200, currency="USD", user_id=user.id),
        Budget(category_id=cat_id("entertainment"), amount=150, currency="USD", user_id=user.id),
        Budget(category_id=cat_id("restaurant"), amount=200, currency="USD", user_id=user.id),
        Budget(category_id=cat_id("health"), amount=100, currency="USD", user_id=user.id),
        Budget(category_id=cat_id("clothing"), amount=80, currency="USD", user_id=user.id),
    ]
    db.add_all(budgets)

    now = datetime.now(UTC)

    def add_days(days: int) -> str:
        return _iso(now.year, now.month, max(1, min(28, now.day + days)))

    reminders = [
        Reminder(
            type="due",
            title="Vencimiento cuota tarjeta de crédito",
            date=add_days(7),
            amount=250,
            currency="USD",
            recurrence="monthly",
            user_id=user.id,
        ),
        Reminder(
            type="payment",
            title="Pago préstamo personal",
            date=add_days(12),
            amount=220,
            currency="USD",
            recurrence="monthly",
            user_id=user.id,
        ),
        Reminder(
            type="payment",
            title="Pago auto",
            date=add_days(5),
            amount=330,
            currency="USD",
            recurrence="monthly",
            user_id=user.id,
        ),
        Reminder(
            type="payment",
            title="Pago alquiler",
            date=add_days(3),
            amount=900,
            currency="USD",
            recurrence="monthly",
            user_id=user.id,
        ),
        Reminder(
            type="subscription",
            title="Renovación Netflix",
            date=add_days(2),
            amount=15.99,
            currency="USD",
            recurrence="monthly",
            user_id=user.id,
        ),
        Reminder(
            type="savings",
            title="Aporte meta vacaciones",
            date=add_days(10),
            amount=300,
            currency="USD",
            recurrence="monthly",
            user_id=user.id,
        ),
        Reminder(
            type="due",
            title="Vencimiento tarjeta",
            date=add_days(-2),
            amount=100,
            currency="USD",
            recurrence="monthly",
            user_id=user.id,
        ),
        Reminder(
            type="payment",
            title="Pago seguro auto",
            date=add_days(25),
            amount=80,
            currency="USD",
            recurrence="monthly",
            user_id=user.id,
        ),
        Reminder(
            type="savings",
            title="Aporte fondo emergencia",
            date=add_days(15),
            amount=500,
            currency="USD",
            recurrence="monthly",
            user_id=user.id,
        ),
        Reminder(
            type="payment",
            title="Pago financiamiento muebles",
            date=add_days(18),
            amount=120,
            currency="USD",
            recurrence="monthly",
            user_id=user.id,
        ),
    ]
    db.add_all(reminders)

    db.commit()


def clear_user_data(db: Session, user: User) -> None:
    db.query(Transaction).filter(Transaction.user_id == user.id).delete()
    db.query(Debt).filter(Debt.user_id == user.id).delete()
    db.query(Loan).filter(Loan.user_id == user.id).delete()
    db.query(SavingsGoal).filter(SavingsGoal.user_id == user.id).delete()
    db.query(Investment).filter(Investment.user_id == user.id).delete()
    db.query(Budget).filter(Budget.user_id == user.id).delete()
    db.query(Reminder).filter(Reminder.user_id == user.id).delete()
    db.query(Category).filter(Category.user_id == user.id, Category.custom).delete()
    db.commit()


def reset_user_to_seed(db: Session, user: User) -> None:
    clear_user_data(db, user)
    seed_demo_data(db, user)
