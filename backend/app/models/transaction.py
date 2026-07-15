"""Transaction SQLAlchemy model."""

from datetime import UTC, datetime

from sqlalchemy import Boolean, Column, Date, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from app.models.base import Base, IdMixin


class Transaction(Base, IdMixin):
    __tablename__ = "transactions"

    type = Column(String(20), nullable=False, index=True)
    kind = Column(String(20), nullable=False, index=True)
    category_id = Column(String(36), ForeignKey("categories.id"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), nullable=False)
    date = Column(Date, nullable=False, index=True)
    description = Column(Text, nullable=False)
    recurring = Column(Boolean, default=False, nullable=False)
    recurring_interval = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    user = relationship("User", back_populates="transactions")
