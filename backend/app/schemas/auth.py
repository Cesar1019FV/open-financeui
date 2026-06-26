"""Pydantic schemas for auth endpoints."""

from pydantic import BaseModel, ConfigDict, EmailStr


class Token(BaseModel):
    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    username: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
