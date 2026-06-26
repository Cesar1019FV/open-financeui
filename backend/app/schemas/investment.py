"""Pydantic schemas for investments."""

from datetime import date as Date

from pydantic import ConfigDict, Field, field_validator

from app.core.constants import VALID_CURRENCIES, VALID_INVESTMENT_TYPES
from app.schemas.base import CamelModel


class InvestmentBase(CamelModel):
    name: str = Field(min_length=1)
    type: str
    ticker: str | None = None
    units: float = Field(gt=0)
    purchase_price: float = Field(gt=0)
    current_price: float = Field(gt=0)
    purchase_date: Date
    currency: str

    @field_validator("type")
    @classmethod
    def check_type(cls, value: str) -> str:
        if value not in VALID_INVESTMENT_TYPES:
            raise ValueError(f"type must be one of {VALID_INVESTMENT_TYPES}")
        return value

    @field_validator("currency")
    @classmethod
    def check_currency(cls, value: str) -> str:
        if value not in VALID_CURRENCIES:
            raise ValueError(f"currency must be one of {VALID_CURRENCIES}")
        return value


class InvestmentCreate(InvestmentBase):
    pass


class InvestmentUpdate(CamelModel):
    name: str | None = None
    type: str | None = None
    ticker: str | None = None
    units: float | None = Field(default=None, gt=0)
    purchase_price: float | None = Field(default=None, gt=0)
    current_price: float | None = Field(default=None, gt=0)
    purchase_date: Date | None = None
    currency: str | None = None


class UpdateValueRequest(CamelModel):
    current_price: float = Field(gt=0)


class InvestmentOut(InvestmentBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    history: list[float]
