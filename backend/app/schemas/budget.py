"""Pydantic schemas for budgets."""

from pydantic import ConfigDict, Field, field_validator

from app.core.constants import VALID_CURRENCIES
from app.schemas.base import CamelModel


class BudgetBase(CamelModel):
    category_id: str = Field(min_length=1)
    amount: float = Field(gt=0)
    currency: str
    period: str = "monthly"

    @field_validator("currency")
    @classmethod
    def check_currency(cls, value: str) -> str:
        if value not in VALID_CURRENCIES:
            raise ValueError(f"currency must be one of {VALID_CURRENCIES}")
        return value


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(CamelModel):
    category_id: str | None = None
    amount: float | None = Field(default=None, gt=0)
    currency: str | None = None
    period: str | None = None


class BudgetOut(BudgetBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
