"""Debt SQLAlchemy model."""

from sqlalchemy import Column, Date, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.models.base import Base, IdMixin


class Debt(Base, IdMixin):
    __tablename__ = "debts"

    creditor = Column(String(255), nullable=False)
    total_amount = Column(Float, nullable=False)
    currency = Column(String(3), nullable=False)
    installment_amount = Column(Float, nullable=False, default=0)
    installments_total = Column(Integer, nullable=False, default=0)
    installments_paid = Column(Integer, nullable=False, default=0)
    interest_rate = Column(Float, nullable=False, default=0)
    start_date = Column(Date, nullable=False)
    due_day = Column(Integer, nullable=False)
    notes = Column(Text, nullable=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    user = relationship("User", back_populates="debts")
