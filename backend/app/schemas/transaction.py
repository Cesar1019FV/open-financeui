"""Pydantic schemas for transactions."""

from datetime import date as Date
from datetime import datetime
from typing import Any

from pydantic import ConfigDict, Field, field_validator, model_validator

from app.core.constants import (
    EXPENSE_KINDS,
    INCOME_KINDS,
    VALID_CURRENCIES,
    VALID_RECURRING_INTERVALS,
)
from app.schemas.base import CamelModel


def _default_kind(type_: str | None) -> str:
    if type_ == "income":
        return "variable"
    return "variable"


class TransactionBase(CamelModel):
    type: str
    kind: str = "variable"
    category_id: str = Field(min_length=1)
    amount: float = Field(gt=0)
    currency: str
    date: Date
    description: str = ""
    recurring: bool = False
    recurring_interval: str | None = None

    @field_validator("currency")
    @classmethod
    def check_currency(cls, value: str) -> str:
        if value not in VALID_CURRENCIES:
            raise ValueError(f"currency must be one of {VALID_CURRENCIES}")
        return value

    @field_validator("kind")
    @classmethod
    def check_kind(cls, value: str, info) -> str:
        data = info.data
        tx_type = data.get("type")
        if tx_type == "income" and value not in INCOME_KINDS:
            raise ValueError(f"income kind must be one of {INCOME_KINDS}")
        if tx_type == "expense" and value not in EXPENSE_KINDS:
            raise ValueError(f"expense kind must be one of {EXPENSE_KINDS}")
        return value

    @field_validator("recurring_interval")
    @classmethod
    def check_recurring(cls, value: str | None, info) -> str | None:
        recurring = info.data.get("recurring")
        if recurring and value not in VALID_RECURRING_INTERVALS:
            raise ValueError(f"recurring_interval must be one of {VALID_RECURRING_INTERVALS}")
        if not recurring:
            return None
        return value


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(CamelModel):
    type: str | None = None
    kind: str | None = None
    category_id: str | None = None
    amount: float | None = Field(default=None, gt=0)
    currency: str | None = None
    date: Date | None = None
    description: str | None = None
    recurring: bool | None = None
    recurring_interval: str | None = None


class TransactionOut(TransactionBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    created_at: datetime

    @model_validator(mode="before")
    @classmethod
    def convert_created_at(cls, data: Any) -> Any:
        if isinstance(data, dict) and "created_at" in data:
            value = data["created_at"]
            if isinstance(value, datetime):
                data["created_at"] = value.replace(tzinfo=None)
        return data
