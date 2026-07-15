"""Pydantic schemas for reminders."""

from datetime import date as Date

from pydantic import ConfigDict, Field, field_validator

from app.core.constants import VALID_CURRENCIES, VALID_REMINDER_RECURRENCES, VALID_REMINDER_TYPES
from app.schemas.base import CamelModel


class ReminderBase(CamelModel):
    type: str
    title: str = Field(min_length=1)
    date: Date
    amount: float | None = None
    currency: str | None = None
    linked_id: str | None = None
    done: bool = False
    recurrence: str

    @field_validator("type")
    @classmethod
    def check_type(cls, value: str) -> str:
        if value not in VALID_REMINDER_TYPES:
            raise ValueError(f"type must be one of {VALID_REMINDER_TYPES}")
        return value

    @field_validator("recurrence")
    @classmethod
    def check_recurrence(cls, value: str) -> str:
        if value not in VALID_REMINDER_RECURRENCES:
            raise ValueError(f"recurrence must be one of {VALID_REMINDER_RECURRENCES}")
        return value

    @field_validator("currency")
    @classmethod
    def check_currency(cls, value: str | None, info) -> str | None:
        amount = info.data.get("amount")
        if amount is not None and value not in VALID_CURRENCIES:
            raise ValueError(f"currency must be one of {VALID_CURRENCIES} when amount is set")
        return value


class ReminderCreate(ReminderBase):
    pass


class ReminderUpdate(CamelModel):
    type: str | None = None
    title: str | None = None
    date: Date | None = None
    amount: float | None = None
    currency: str | None = None
    linked_id: str | None = None
    done: bool | None = None
    recurrence: str | None = None


class ReminderOut(ReminderBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
