"""Summary and aggregate endpoints."""

from datetime import UTC, date, datetime
from typing import Annotated

from fastapi import APIRouter, Query

from app.api.deps import CurrentUserDep, DbDep
from app.core.constants import TRANSACTION_KINDS, convert_amount
from app.models.debt import Debt
from app.models.investment import Investment
from app.models.loan import Loan
from app.models.savings_goal import SavingsGoal
from app.models.transaction import Transaction
from app.schemas.summary import (
    CategoryBreakdownItem,
    MonthlySummaryOut,
    MonthPoint,
    NetWorthOut,
)

router = APIRouter(prefix="/summary", tags=["summary"])


def _year_month(d: date) -> str:
    return f"{d.year}-{d.month:02d}"


@router.get("/monthly", response_model=MonthlySummaryOut)
def monthly_summary(
    current_user: CurrentUserDep,
    db: DbDep,
    year_month: Annotated[str | None, Query()] = None,
    currency: Annotated[str, Query()] = "USD",
) -> MonthlySummaryOut:
    if year_month is None:
        year_month = _year_month(datetime.now(UTC))
    transactions = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.date.startswith(year_month),
        )
        .all()
    )

    prev_month = int(year_month.split("-")[1]) - 1
    prev_year = int(year_month.split("-")[0])
    if prev_month == 0:
        prev_month = 12
        prev_year -= 1
    prev_year_month = f"{prev_year}-{prev_month:02d}"
    prev_transactions = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.date.startswith(prev_year_month),
        )
        .all()
    )

    by_kind: dict[str, float] = dict.fromkeys(TRANSACTION_KINDS, 0.0)
    by_category: dict[str, dict[str, float]] = {}
    total_income = 0.0
    total_expense = 0.0

    for tx in transactions:
        converted = convert_amount(tx.amount, tx.currency, currency)
        by_kind[tx.kind] += converted
        cat = by_category.setdefault(tx.category_id, {"income": 0.0, "expense": 0.0})
        if tx.type == "income":
            total_income += converted
            cat["income"] += converted
        else:
            total_expense += converted
            cat["expense"] += converted

    prev_income = 0.0
    prev_expense = 0.0
    for tx in prev_transactions:
        converted = convert_amount(tx.amount, tx.currency, currency)
        if tx.type == "income":
            prev_income += converted
        else:
            prev_expense += converted

    return MonthlySummaryOut(
        total_income=total_income,
        total_expense=total_expense,
        net=total_income - total_expense,
        by_category=[
            {"category_id": cat_id, "income": vals["income"], "expense": vals["expense"]}
            for cat_id, vals in by_category.items()
        ],
        by_kind=by_kind,
        vs_previous={
            "income_delta": total_income - prev_income,
            "expense_delta": total_expense - prev_expense,
            "net_delta": (total_income - total_expense) - (prev_income - prev_expense),
        },
    )


@router.get("/last-6-months", response_model=list[MonthPoint])
def last_6_months(
    current_user: CurrentUserDep,
    db: DbDep,
    currency: Annotated[str, Query()] = "USD",
) -> list[MonthPoint]:
    now = datetime.now(UTC)
    points: list[MonthPoint] = []
    for i in range(5, -1, -1):
        d = datetime(now.year, now.month - i, 1)
        year_month = f"{d.year}-{d.month:02d}"
        month_transactions = (
            db.query(Transaction)
            .filter(
                Transaction.user_id == current_user.id,
                Transaction.date.startswith(year_month),
            )
            .all()
        )
        income = 0.0
        expense = 0.0
        for tx in month_transactions:
            converted = convert_amount(tx.amount, tx.currency, currency)
            if tx.type == "income":
                income += converted
            else:
                expense += converted
        points.append(
            MonthPoint(year_month=year_month, income=income, expense=expense, net=income - expense)
        )
    return points


@router.get("/category-breakdown", response_model=list[CategoryBreakdownItem])
def category_breakdown(
    current_user: CurrentUserDep,
    db: DbDep,
    year_month: Annotated[str | None, Query()] = None,
    currency: Annotated[str, Query()] = "USD",
) -> list[CategoryBreakdownItem]:
    if year_month is None:
        year_month = _year_month(datetime.now(UTC))
    transactions = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.date.startswith(year_month),
            Transaction.type == "expense",
        )
        .all()
    )
    totals: dict[str, float] = {}
    for tx in transactions:
        converted = convert_amount(tx.amount, tx.currency, currency)
        totals[tx.category_id] = totals.get(tx.category_id, 0.0) + converted
    total = sum(totals.values())
    breakdown = [
        CategoryBreakdownItem(
            category_id=cat_id, amount=amount, percent=(amount / total if total else 0)
        )
        for cat_id, amount in totals.items()
    ]
    return sorted(breakdown, key=lambda x: x.amount, reverse=True)


@router.get("/net-worth", response_model=NetWorthOut)
def net_worth(
    current_user: CurrentUserDep,
    db: DbDep,
    currency: Annotated[str, Query()] = "USD",
) -> NetWorthOut:
    savings = sum(
        convert_amount(g.current_amount, g.currency, currency)
        for g in db.query(SavingsGoal).filter(SavingsGoal.user_id == current_user.id).all()
    )
    investments = sum(
        convert_amount(inv.units * inv.current_price, inv.currency, currency)
        for inv in db.query(Investment).filter(Investment.user_id == current_user.id).all()
    )
    receivable = 0.0
    for loan in db.query(Loan).filter(Loan.user_id == current_user.id).all():
        total_paid = sum(p.amount for p in loan.payments)
        receivable += convert_amount(max(0, loan.amount - total_paid), loan.currency, currency)
    debts = sum(
        convert_amount(
            max(0, d.total_amount - d.installment_amount * d.installments_paid),
            d.currency,
            currency,
        )
        for d in db.query(Debt).filter(Debt.user_id == current_user.id).all()
    )
    return NetWorthOut(
        savings=savings,
        investments=investments,
        receivable=receivable,
        debts=debts,
        total=savings + investments + receivable - debts,
    )
