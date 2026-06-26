"""Reminder SQLAlchemy model."""

from sqlalchemy import Boolean, Column, Date, Float, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from app.models.base import Base, IdMixin


class Reminder(Base, IdMixin):
    __tablename__ = "reminders"

    type = Column(String(20), nullable=False)
    title = Column(Text, nullable=False)
    date = Column(Date, nullable=False, index=True)
    amount = Column(Float, nullable=True)
    currency = Column(String(3), nullable=True)
    linked_id = Column(String(36), nullable=True)
    done = Column(Boolean, default=False, nullable=False)
    recurrence = Column(String(20), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    user = relationship("User", back_populates="reminders")
