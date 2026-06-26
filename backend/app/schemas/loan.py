"""Pydantic schemas for loans."""

from datetime import date as Date

from pydantic import ConfigDict, Field, field_validator

from app.core.constants import VALID_CURRENCIES
from app.schemas.base import CamelModel


class LoanPaymentCreate(CamelModel):
    date: Date
    amount: float = Field(gt=0)


class LoanPaymentOut(LoanPaymentCreate):
    model_config = ConfigDict(from_attributes=True)
    id: str


class LoanBase(CamelModel):
    debtor: str = Field(min_length=1)
    amount: float = Field(gt=0)
    currency: str
    date: Date
    notes: str | None = None

    @field_validator("currency")
    @classmethod
    def check_currency(cls, value: str) -> str:
        if value not in VALID_CURRENCIES:
            raise ValueError(f"currency must be one of {VALID_CURRENCIES}")
        return value


class LoanCreate(LoanBase):
    pass


class LoanUpdate(CamelModel):
    debtor: str | None = None
    amount: float | None = Field(default=None, gt=0)
    currency: str | None = None
    date: Date | None = None
    notes: str | None = None


class LoanOut(LoanBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    payments_made: list[LoanPaymentOut]
