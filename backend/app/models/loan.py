"""Loan SQLAlchemy model."""

from datetime import UTC, datetime

from sqlalchemy import Column, Date, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from app.models.base import Base, IdMixin


class Loan(Base, IdMixin):
    __tablename__ = "loans"

    debtor = Column(String(255), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), nullable=False)
    date = Column(Date, nullable=False)
    notes = Column(Text, nullable=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    user = relationship("User", back_populates="loans")
    payments = relationship("LoanPayment", back_populates="loan", cascade="all, delete-orphan")


class LoanPayment(Base, IdMixin):
    __tablename__ = "loan_payments"

    loan_id = Column(String(36), ForeignKey("loans.id"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    amount = Column(Float, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC), nullable=False)

    loan = relationship("Loan", back_populates="payments")
