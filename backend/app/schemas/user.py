"""Pydantic schemas for users and preferences."""

from pydantic import ConfigDict, EmailStr, Field

from app.schemas.base import CamelModel


class UserBase(CamelModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(min_length=6)


class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: str


class UserPreferences(CamelModel):
    model_config = ConfigDict(from_attributes=True)
    theme: str = "system"
    locale: str = "es"
    currency: str = "USD"


class UserPreferencesUpdate(CamelModel):
    theme: str | None = None
    locale: str | None = None
    currency: str | None = None
