"""Budgets endpoints."""

from fastapi import APIRouter, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import CurrentUserDep, DbDep
from app.models.budget import Budget
from app.models.category import Category
from app.schemas.budget import BudgetCreate, BudgetOut, BudgetUpdate

router = APIRouter(prefix="/budgets", tags=["budgets"])


def _validate_expense_category(db: Session, user_id: str, category_id: str) -> None:
    category = (
        db.query(Category).filter(Category.id == category_id, Category.user_id == user_id).first()
    )
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    if category.type not in ("expense", "both"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Budgets can only be set for expense categories",
        )


@router.get("/", response_model=list[BudgetOut])
def list_budgets(current_user: CurrentUserDep, db: DbDep) -> list[Budget]:
    return db.query(Budget).filter(Budget.user_id == current_user.id).all()


@router.post("/", response_model=BudgetOut, status_code=status.HTTP_201_CREATED)
def set_budget(current_user: CurrentUserDep, db: DbDep, payload: BudgetCreate) -> Budget:
    _validate_expense_category(db, current_user.id, payload.category_id)
    existing = (
        db.query(Budget)
        .filter(
            Budget.user_id == current_user.id,
            Budget.category_id == payload.category_id,
        )
        .first()
    )
    if existing:
        existing.amount = payload.amount
        existing.currency = payload.currency
        existing.period = payload.period
        db.commit()
        db.refresh(existing)
        return existing
    budget = Budget(
        category_id=payload.category_id,
        amount=payload.amount,
        currency=payload.currency,
        period=payload.period,
        user_id=current_user.id,
    )
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


@router.patch("/{budget_id}", response_model=BudgetOut)
def update_budget(
    current_user: CurrentUserDep,
    db: DbDep,
    budget_id: str,
    payload: BudgetUpdate,
) -> Budget:
    budget = (
        db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    )
    if budget is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
    data = payload.model_dump(exclude_unset=True)
    if "category_id" in data:
        _validate_expense_category(db, current_user.id, data["category_id"])
    for field, value in data.items():
        setattr(budget, field, value)
    db.commit()
    db.refresh(budget)
    return budget


@router.delete("/{budget_id}")
def delete_budget(current_user: CurrentUserDep, db: DbDep, budget_id: str) -> dict:
    budget = (
        db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    )
    if budget is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
    db.delete(budget)
    db.commit()
    return {"success": True}
