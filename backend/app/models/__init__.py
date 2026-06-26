"""Central place to import all models so Base.metadata can create tables."""

from app.models.base import Base
from app.models.budget import Budget
from app.models.category import Category
from app.models.debt import Debt
from app.models.investment import Investment, InvestmentHistory
from app.models.loan import Loan, LoanPayment
from app.models.reminder import Reminder
from app.models.savings_goal import SavingsGoal
from app.models.transaction import Transaction
from app.models.user import User, UserPreference

__all__ = [
    "Base",
    "Budget",
    "Category",
    "Debt",
    "Investment",
    "InvestmentHistory",
    "Loan",
    "LoanPayment",
    "Reminder",
    "SavingsGoal",
    "Transaction",
    "User",
    "UserPreference",
]
