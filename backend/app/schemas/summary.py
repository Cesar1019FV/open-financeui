"""Pydantic schemas for summary endpoints."""

from pydantic import BaseModel


class VsPrevious(BaseModel):
    income_delta: float
    expense_delta: float
    net_delta: float


class MonthlySummaryOut(BaseModel):
    total_income: float
    total_expense: float
    net: float
    by_category: list[dict]
    by_kind: dict[str, float]
    vs_previous: VsPrevious


class MonthPoint(BaseModel):
    year_month: str
    income: float
    expense: float
    net: float


class CategoryBreakdownItem(BaseModel):
    category_id: str
    amount: float
    percent: float


class NetWorthOut(BaseModel):
    savings: float
    investments: float
    receivable: float
    debts: float
    total: float
