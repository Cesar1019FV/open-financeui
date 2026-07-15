"""Base SQLAlchemy model utilities."""

import uuid

from sqlalchemy import Column, String
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


def generate_id() -> str:
    return str(uuid.uuid4())


class IdMixin:
    id = Column(String(36), primary_key=True, default=generate_id)
