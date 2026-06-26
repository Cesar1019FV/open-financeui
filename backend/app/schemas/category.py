"""Pydantic schemas for categories."""

from pydantic import ConfigDict, Field, field_validator

from app.core.constants import TRANSACTION_KINDS, VALID_CATEGORY_TYPES, is_valid_hex
from app.schemas.base import CamelModel


class CategoryBase(CamelModel):
    name_key: str = Field(min_length=1)
    type: str
    kind: str | None = None
    icon: str = Field(min_length=1)
    color: str

    @field_validator("type")
    @classmethod
    def check_type(cls, value: str) -> str:
        if value not in VALID_CATEGORY_TYPES:
            raise ValueError(f"type must be one of {VALID_CATEGORY_TYPES}")
        return value

    @field_validator("color")
    @classmethod
    def check_color(cls, value: str) -> str:
        if not is_valid_hex(value):
            raise ValueError("color must be a 7-character hex string like #RRGGBB")
        return value

    @field_validator("kind")
    @classmethod
    def check_kind(cls, value: str | None, info) -> str | None:
        if value is None:
            return None
        if value not in TRANSACTION_KINDS:
            raise ValueError(f"kind must be one of {TRANSACTION_KINDS}")
        data = info.data
        category_type = data.get("type")
        if category_type and category_type != "both":
            valid_for_type = (
                ["salary", "variable", "passive", "other"]
                if category_type == "income"
                else ["fixed", "variable", "occasional"]
            )
            if value not in valid_for_type:
                raise ValueError(f"kind {value} is not valid for type {category_type}")
        return value


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(CamelModel):
    name_key: str | None = None
    type: str | None = None
    kind: str | None = None
    icon: str | None = None
    color: str | None = None


class CategoryOut(CategoryBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    custom: bool
    is_default: bool
