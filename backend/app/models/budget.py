"""Budget SQLAlchemy model."""

from sqlalchemy import Column, Float, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.models.base import Base, IdMixin


class Budget(Base, IdMixin):
    __tablename__ = "budgets"
    __table_args__ = (UniqueConstraint("user_id", "category_id", name="uix_user_category"),)

    category_id = Column(String(36), ForeignKey("categories.id"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), nullable=False)
    period = Column(String(20), default="monthly", nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    user = relationship("User", back_populates="budgets")
