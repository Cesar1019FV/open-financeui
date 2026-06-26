"""Debts endpoints."""

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUserDep, DbDep
from app.models.debt import Debt
from app.schemas.debt import DebtCreate, DebtOut, DebtUpdate

router = APIRouter(prefix="/debts", tags=["debts"])


@router.get("/", response_model=list[DebtOut])
def list_debts(current_user: CurrentUserDep, db: DbDep) -> list[Debt]:
    return db.query(Debt).filter(Debt.user_id == current_user.id).all()


@router.post("/", response_model=DebtOut, status_code=status.HTTP_201_CREATED)
def create_debt(current_user: CurrentUserDep, db: DbDep, payload: DebtCreate) -> Debt:
    debt = Debt(
        creditor=payload.creditor,
        total_amount=payload.total_amount,
        currency=payload.currency,
        installment_amount=payload.installment_amount,
        installments_total=payload.installments_total,
        installments_paid=payload.installments_paid,
        interest_rate=payload.interest_rate,
        start_date=payload.start_date,
        due_day=payload.due_day,
        notes=payload.notes,
        user_id=current_user.id,
    )
    db.add(debt)
    db.commit()
    db.refresh(debt)
    return debt


@router.patch("/{debt_id}", response_model=DebtOut)
def update_debt(
    current_user: CurrentUserDep,
    db: DbDep,
    debt_id: str,
    payload: DebtUpdate,
) -> Debt:
    debt = db.query(Debt).filter(Debt.id == debt_id, Debt.user_id == current_user.id).first()
    if debt is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Debt not found")
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(debt, field, value)
    db.commit()
    db.refresh(debt)
    return debt


@router.delete("/{debt_id}")
def delete_debt(current_user: CurrentUserDep, db: DbDep, debt_id: str) -> dict:
    debt = db.query(Debt).filter(Debt.id == debt_id, Debt.user_id == current_user.id).first()
    if debt is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Debt not found")
    db.delete(debt)
    db.commit()
    return {"success": True}


@router.post("/{debt_id}/pay-installment", response_model=DebtOut)
def pay_installment(current_user: CurrentUserDep, db: DbDep, debt_id: str) -> Debt:
    debt = db.query(Debt).filter(Debt.id == debt_id, Debt.user_id == current_user.id).first()
    if debt is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Debt not found")
    if debt.installments_total == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="This debt has no fixed installments",
        )
    debt.installments_paid += 1
    db.commit()
    db.refresh(debt)
    return debt
