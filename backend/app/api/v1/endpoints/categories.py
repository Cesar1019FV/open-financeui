"""Categories CRUD endpoints."""

from typing import Annotated

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUserDep, DbDep
from app.core.constants import EXPENSE_KINDS, INCOME_KINDS
from app.models.category import Category
from app.models.transaction import Transaction
from app.schemas.category import CategoryCreate, CategoryOut, CategoryUpdate

router = APIRouter(prefix="/categories", tags=["categories"])


def _kind_for_type(category_type: str, kind: str | None) -> str | None:
    if category_type == "both":
        return kind
    valid = INCOME_KINDS if category_type == "income" else EXPENSE_KINDS
    if kind and kind not in valid:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"kind must be one of {valid} for type {category_type}",
        )
    return kind


@router.get("/", response_model=list[CategoryOut])
def list_categories(
    current_user: CurrentUserDep,
    db: DbDep,
    type: Annotated[str | None, None] = None,
) -> list[Category]:
    query = db.query(Category).filter(Category.user_id == current_user.id)
    if type:
        query = query.filter((Category.type == type) | (Category.type == "both"))
    return query.order_by(Category.name_key).all()


@router.post("/", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(current_user: CurrentUserDep, db: DbDep, payload: CategoryCreate) -> Category:
    kind = _kind_for_type(payload.type, payload.kind)
    category = Category(
        name_key=payload.name_key,
        type=payload.type,
        kind=kind,
        icon=payload.icon,
        color=payload.color,
        custom=True,
        is_default=False,
        user_id=current_user.id,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.patch("/{category_id}", response_model=CategoryOut)
def update_category(
    current_user: CurrentUserDep,
    db: DbDep,
    category_id: str,
    payload: CategoryUpdate,
) -> Category:
    category = (
        db.query(Category)
        .filter(Category.id == category_id, Category.user_id == current_user.id)
        .first()
    )
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    if category.is_default and payload.name_key is not None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Cannot change name_key of default category",
        )
    data = payload.model_dump(exclude_unset=True)
    new_type = data.get("type", category.type)
    new_kind = data.get("kind", category.kind)
    data["kind"] = _kind_for_type(new_type, new_kind)
    for field, value in data.items():
        setattr(category, field, value)
    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}")
def delete_category(current_user: CurrentUserDep, db: DbDep, category_id: str) -> dict:
    category = (
        db.query(Category)
        .filter(Category.id == category_id, Category.user_id == current_user.id)
        .first()
    )
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    if category.is_default:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Default categories cannot be deleted",
        )
    in_use = (
        db.query(Transaction)
        .filter(Transaction.category_id == category_id, Transaction.user_id == current_user.id)
        .first()
    )
    if in_use:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Category in use. Reassign transactions first.",
        )
    db.delete(category)
    db.commit()
    return {"success": True}
