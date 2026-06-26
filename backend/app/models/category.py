"""Category SQLAlchemy model."""

from sqlalchemy import Boolean, Column, ForeignKey, String
from sqlalchemy.orm import relationship

from app.models.base import Base, IdMixin


class Category(Base, IdMixin):
    __tablename__ = "categories"

    name_key = Column(String(255), nullable=False)
    type = Column(String(20), nullable=False)
    kind = Column(String(20), nullable=True)
    icon = Column(String(20), nullable=False)
    color = Column(String(7), nullable=False)
    custom = Column(Boolean, default=False, nullable=False)
    is_default = Column(Boolean, default=False, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)

    user = relationship("User", back_populates="categories")
