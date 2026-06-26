"""Investments endpoints."""

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUserDep, DbDep
from app.models.investment import Investment, InvestmentHistory
from app.schemas.investment import (
    InvestmentCreate,
    InvestmentOut,
    InvestmentUpdate,
    UpdateValueRequest,
)

router = APIRouter(prefix="/investments", tags=["investments"])

HISTORY_SIZE = 30


def _serialize_investment(inv: Investment) -> InvestmentOut:
    history = sorted(inv.history_points, key=lambda h: h.sequence)
    return InvestmentOut(
        id=inv.id,
        name=inv.name,
        type=inv.type,
        ticker=inv.ticker,
        units=inv.units,
        purchase_price=inv.purchase_price,
        current_price=inv.current_price,
        purchase_date=inv.purchase_date,
        currency=inv.currency,
        history=[h.price for h in history],
    )


@router.get("/", response_model=list[InvestmentOut])
def list_investments(current_user: CurrentUserDep, db: DbDep) -> list[InvestmentOut]:
    investments = db.query(Investment).filter(Investment.user_id == current_user.id).all()
    return [_serialize_investment(inv) for inv in investments]


@router.post("/", response_model=InvestmentOut, status_code=status.HTTP_201_CREATED)
def create_investment(
    current_user: CurrentUserDep, db: DbDep, payload: InvestmentCreate
) -> InvestmentOut:
    inv = Investment(
        name=payload.name,
        type=payload.type,
        ticker=payload.ticker,
        units=payload.units,
        purchase_price=payload.purchase_price,
        current_price=payload.current_price,
        purchase_date=payload.purchase_date,
        currency=payload.currency,
        user_id=current_user.id,
    )
    for seq, price in enumerate([payload.purchase_price, payload.current_price]):
        inv.history_points.append(InvestmentHistory(sequence=seq, price=price))
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return _serialize_investment(inv)


@router.patch("/{investment_id}", response_model=InvestmentOut)
def update_investment(
    current_user: CurrentUserDep,
    db: DbDep,
    investment_id: str,
    payload: InvestmentUpdate,
) -> InvestmentOut:
    inv = (
        db.query(Investment)
        .filter(Investment.id == investment_id, Investment.user_id == current_user.id)
        .first()
    )
    if inv is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investment not found")
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(inv, field, value)
    db.commit()
    db.refresh(inv)
    return _serialize_investment(inv)


@router.delete("/{investment_id}")
def delete_investment(current_user: CurrentUserDep, db: DbDep, investment_id: str) -> dict:
    inv = (
        db.query(Investment)
        .filter(Investment.id == investment_id, Investment.user_id == current_user.id)
        .first()
    )
    if inv is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investment not found")
    db.delete(inv)
    db.commit()
    return {"success": True}


@router.post("/{investment_id}/update-value", response_model=InvestmentOut)
def update_value(
    current_user: CurrentUserDep,
    db: DbDep,
    investment_id: str,
    payload: UpdateValueRequest,
) -> InvestmentOut:
    inv = (
        db.query(Investment)
        .filter(Investment.id == investment_id, Investment.user_id == current_user.id)
        .first()
    )
    if inv is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investment not found")
    inv.current_price = payload.current_price
    history = sorted(inv.history_points, key=lambda h: h.sequence)
    next_seq = (history[-1].sequence + 1) if history else 0
    inv.history_points.append(InvestmentHistory(sequence=next_seq, price=payload.current_price))
    if len(inv.history_points) > HISTORY_SIZE:
        oldest = min(inv.history_points, key=lambda h: h.sequence)
        db.delete(oldest)
    db.commit()
    db.refresh(inv)
    return _serialize_investment(inv)
