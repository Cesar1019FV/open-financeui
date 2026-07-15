"""User SQLAlchemy model."""

from datetime import UTC, datetime

from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship

from app.models.base import Base, IdMixin


class User(Base, IdMixin):
    __tablename__ = "users"

    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC), nullable=False)

    preferences = relationship("UserPreference", back_populates="user", uselist=False)
    categories = relationship("Category", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")
    debts = relationship("Debt", back_populates="user")
    loans = relationship("Loan", back_populates="user")
    savings_goals = relationship("SavingsGoal", back_populates="user")
    investments = relationship("Investment", back_populates="user")
    budgets = relationship("Budget", back_populates="user")
    reminders = relationship("Reminder", back_populates="user")


class UserPreference(Base, IdMixin):
    __tablename__ = "user_preferences"

    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    theme = Column(String(20), default="system")
    locale = Column(String(10), default="es")
    currency = Column(String(3), default="USD")
    updated_at = Column(DateTime, default=lambda: datetime.now(UTC), nullable=False)

    user = relationship("User", back_populates="preferences")
