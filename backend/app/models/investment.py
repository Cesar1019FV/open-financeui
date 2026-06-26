"""Investment SQLAlchemy model."""

from sqlalchemy import Column, Date, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.models.base import Base, IdMixin


class Investment(Base, IdMixin):
    __tablename__ = "investments"

    name = Column(String(255), nullable=False)
    type = Column(String(20), nullable=False)
    ticker = Column(String(50), nullable=True)
    units = Column(Float, nullable=False)
    purchase_price = Column(Float, nullable=False)
    current_price = Column(Float, nullable=False)
    purchase_date = Column(Date, nullable=False)
    currency = Column(String(3), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    user = relationship("User", back_populates="investments")
    history_points = relationship(
        "InvestmentHistory", back_populates="investment", cascade="all, delete-orphan"
    )


class InvestmentHistory(Base, IdMixin):
    __tablename__ = "investment_history"

    investment_id = Column(String(36), ForeignKey("investments.id"), nullable=False, index=True)
    sequence = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)

    investment = relationship("Investment", back_populates="history_points")
