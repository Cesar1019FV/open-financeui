"""Main API v1 router."""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    budgets,
    categories,
    data,
    debts,
    investments,
    loans,
    reminders,
    savings_goals,
    summary,
    transactions,
    users,
)

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router)
router.include_router(users.router)
router.include_router(categories.router)
router.include_router(transactions.router)
router.include_router(debts.router)
router.include_router(loans.router)
router.include_router(savings_goals.router)
router.include_router(investments.router)
router.include_router(budgets.router)
router.include_router(reminders.router)
router.include_router(summary.router)
router.include_router(data.router)
