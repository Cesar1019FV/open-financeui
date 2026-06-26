"""Savings goal SQLAlchemy model."""

from sqlalchemy import Boolean, Column, Date, Float, ForeignKey, String
from sqlalchemy.orm import relationship

from app.models.base import Base, IdMixin


class SavingsGoal(Base, IdMixin):
    __tablename__ = "savings_goals"

    name = Column(String(255), nullable=False)
    target_amount = Column(Float, nullable=False)
    currency = Column(String(3), nullable=False)
    current_amount = Column(Float, nullable=False, default=0)
    target_date = Column(Date, nullable=True)
    is_emergency_fund = Column(Boolean, default=False, nullable=False)
    monthly_contribution = Column(Float, nullable=False, default=0)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    user = relationship("User", back_populates="savings_goals")
