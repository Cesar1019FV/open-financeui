"""Pydantic schemas for savings goals."""

from datetime import date as Date

from pydantic import ConfigDict, Field, field_validator

from app.core.constants import VALID_CURRENCIES
from app.schemas.base import CamelModel


class SavingsGoalBase(CamelModel):
    name: str = Field(min_length=1)
    target_amount: float = Field(gt=0)
    currency: str
    current_amount: float = 0
    target_date: Date | None = None
    is_emergency_fund: bool = False
    monthly_contribution: float = 0

    @field_validator("currency")
    @classmethod
    def check_currency(cls, value: str) -> str:
        if value not in VALID_CURRENCIES:
            raise ValueError(f"currency must be one of {VALID_CURRENCIES}")
        return value


class SavingsGoalCreate(SavingsGoalBase):
    pass


class SavingsGoalUpdate(CamelModel):
    name: str | None = None
    target_amount: float | None = Field(default=None, gt=0)
    currency: str | None = None
    current_amount: float | None = None
    target_date: Date | None = None
    is_emergency_fund: bool | None = None
    monthly_contribution: float | None = None


class ContributionRequest(CamelModel):
    amount: float = Field(gt=0)


class WithdrawRequest(CamelModel):
    amount: float = Field(gt=0)


class SavingsGoalOut(SavingsGoalBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
