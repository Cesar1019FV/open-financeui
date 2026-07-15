"""Transactions endpoints."""

from fastapi import APIRouter, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import CurrentUserDep, DbDep
from app.models.category import Category
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate, TransactionOut, TransactionUpdate

router = APIRouter(prefix="/transactions", tags=["transactions"])


def _validate_category_for_transaction(
    db: Session, user_id: str, category_id: str, tx_type: str
) -> None:
    category = (
        db.query(Category).filter(Category.id == category_id, Category.user_id == user_id).first()
    )
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    if category.type != tx_type and category.type != "both":
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Category type does not match transaction type",
        )


@router.get("/", response_model=list[TransactionOut])
def list_transactions(current_user: CurrentUserDep, db: DbDep) -> list[Transaction]:
    return (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id)
        .order_by(Transaction.date.desc(), Transaction.created_at.desc())
        .all()
    )


@router.post("/", response_model=TransactionOut, status_code=status.HTTP_201_CREATED)
def create_transaction(
    current_user: CurrentUserDep, db: DbDep, payload: TransactionCreate
) -> Transaction:
    _validate_category_for_transaction(db, current_user.id, payload.category_id, payload.type)
    tx = Transaction(
        type=payload.type,
        kind=payload.kind,
        category_id=payload.category_id,
        amount=payload.amount,
        currency=payload.currency,
        date=payload.date,
        description=payload.description,
        recurring=payload.recurring,
        recurring_interval=payload.recurring_interval,
        user_id=current_user.id,
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx


@router.get("/{transaction_id}", response_model=TransactionOut)
def get_transaction(current_user: CurrentUserDep, db: DbDep, transaction_id: str) -> Transaction:
    tx = (
        db.query(Transaction)
        .filter(Transaction.id == transaction_id, Transaction.user_id == current_user.id)
        .first()
    )
    if tx is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    return tx


@router.patch("/{transaction_id}", response_model=TransactionOut)
def update_transaction(
    current_user: CurrentUserDep,
    db: DbDep,
    transaction_id: str,
    payload: TransactionUpdate,
) -> Transaction:
    tx = (
        db.query(Transaction)
        .filter(Transaction.id == transaction_id, Transaction.user_id == current_user.id)
        .first()
    )
    if tx is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    data = payload.model_dump(exclude_unset=True)
    new_type = data.get("type", tx.type)
    category_id = data.get("category_id", tx.category_id)
    _validate_category_for_transaction(db, current_user.id, category_id, new_type)
    for field, value in data.items():
        setattr(tx, field, value)
    db.commit()
    db.refresh(tx)
    return tx


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(current_user: CurrentUserDep, db: DbDep, transaction_id: str) -> None:
    tx = (
        db.query(Transaction)
        .filter(Transaction.id == transaction_id, Transaction.user_id == current_user.id)
        .first()
    )
    if tx is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    db.delete(tx)
    db.commit()
