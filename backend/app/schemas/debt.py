"""Pydantic schemas for debts."""

from datetime import date as Date

from pydantic import ConfigDict, Field, field_validator

from app.core.constants import VALID_CURRENCIES
from app.schemas.base import CamelModel


class DebtBase(CamelModel):
    creditor: str = Field(min_length=1)
    total_amount: float = Field(gt=0)
    currency: str
    installment_amount: float = 0
    installments_total: int = 0
    installments_paid: int = 0
    interest_rate: float = 0
    start_date: Date
    due_day: int = Field(ge=1, le=28)
    notes: str | None = None

    @field_validator("currency")
    @classmethod
    def check_currency(cls, value: str) -> str:
        if value not in VALID_CURRENCIES:
            raise ValueError(f"currency must be one of {VALID_CURRENCIES}")
        return value

    @field_validator("installment_amount")
    @classmethod
    def check_installment_amount(cls, value: float, info) -> float:
        total = info.data.get("installments_total", 0)
        if total > 0 and value <= 0:
            raise ValueError("installment_amount must be > 0 when installments_total > 0")
        return value


class DebtCreate(DebtBase):
    pass


class DebtUpdate(CamelModel):
    creditor: str | None = None
    total_amount: float | None = Field(default=None, gt=0)
    currency: str | None = None
    installment_amount: float | None = None
    installments_total: int | None = None
    installments_paid: int | None = None
    interest_rate: float | None = None
    start_date: Date | None = None
    due_day: int | None = Field(default=None, ge=1, le=28)
    notes: str | None = None


class DebtOut(DebtBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
