"""Loans endpoints."""

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUserDep, DbDep
from app.models.loan import Loan, LoanPayment
from app.schemas.loan import LoanCreate, LoanOut, LoanPaymentCreate, LoanUpdate

router = APIRouter(prefix="/loans", tags=["loans"])


@router.get("/", response_model=list[LoanOut])
def list_loans(current_user: CurrentUserDep, db: DbDep) -> list[Loan]:
    return db.query(Loan).filter(Loan.user_id == current_user.id).all()


@router.post("/", response_model=LoanOut, status_code=status.HTTP_201_CREATED)
def create_loan(current_user: CurrentUserDep, db: DbDep, payload: LoanCreate) -> Loan:
    loan = Loan(
        debtor=payload.debtor,
        amount=payload.amount,
        currency=payload.currency,
        date=payload.date,
        notes=payload.notes,
        user_id=current_user.id,
    )
    db.add(loan)
    db.commit()
    db.refresh(loan)
    return loan


@router.patch("/{loan_id}", response_model=LoanOut)
def update_loan(
    current_user: CurrentUserDep,
    db: DbDep,
    loan_id: str,
    payload: LoanUpdate,
) -> Loan:
    loan = db.query(Loan).filter(Loan.id == loan_id, Loan.user_id == current_user.id).first()
    if loan is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loan not found")
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(loan, field, value)
    db.commit()
    db.refresh(loan)
    return loan


@router.delete("/{loan_id}")
def delete_loan(current_user: CurrentUserDep, db: DbDep, loan_id: str) -> dict:
    loan = db.query(Loan).filter(Loan.id == loan_id, Loan.user_id == current_user.id).first()
    if loan is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loan not found")
    db.delete(loan)
    db.commit()
    return {"success": True}


@router.post("/{loan_id}/payments", response_model=LoanOut)
def register_payment(
    current_user: CurrentUserDep,
    db: DbDep,
    loan_id: str,
    payload: LoanPaymentCreate,
) -> Loan:
    loan = db.query(Loan).filter(Loan.id == loan_id, Loan.user_id == current_user.id).first()
    if loan is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loan not found")
    total_paid = sum(p.amount for p in loan.payments)
    if payload.amount > loan.amount - total_paid:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Payment exceeds remaining amount",
        )
    payment = LoanPayment(date=payload.date, amount=payload.amount, loan_id=loan.id)
    db.add(payment)
    db.commit()
    db.refresh(loan)
    return loan
