"""Savings goals endpoints."""

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUserDep, DbDep
from app.models.savings_goal import SavingsGoal
from app.schemas.savings_goal import (
    ContributionRequest,
    SavingsGoalCreate,
    SavingsGoalOut,
    SavingsGoalUpdate,
    WithdrawRequest,
)

router = APIRouter(prefix="/savings-goals", tags=["savings-goals"])


@router.get("/", response_model=list[SavingsGoalOut])
def list_savings_goals(current_user: CurrentUserDep, db: DbDep) -> list[SavingsGoal]:
    return db.query(SavingsGoal).filter(SavingsGoal.user_id == current_user.id).all()


@router.post("/", response_model=SavingsGoalOut, status_code=status.HTTP_201_CREATED)
def create_savings_goal(
    current_user: CurrentUserDep, db: DbDep, payload: SavingsGoalCreate
) -> SavingsGoal:
    if payload.is_emergency_fund:
        existing = (
            db.query(SavingsGoal)
            .filter(
                SavingsGoal.user_id == current_user.id,
                SavingsGoal.is_emergency_fund,
            )
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Only one emergency fund is allowed",
            )
    goal = SavingsGoal(
        name=payload.name,
        target_amount=payload.target_amount,
        currency=payload.currency,
        current_amount=payload.current_amount,
        target_date=payload.target_date,
        is_emergency_fund=payload.is_emergency_fund,
        monthly_contribution=payload.monthly_contribution,
        user_id=current_user.id,
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@router.patch("/{goal_id}", response_model=SavingsGoalOut)
def update_savings_goal(
    current_user: CurrentUserDep,
    db: DbDep,
    goal_id: str,
    payload: SavingsGoalUpdate,
) -> SavingsGoal:
    goal = (
        db.query(SavingsGoal)
        .filter(SavingsGoal.id == goal_id, SavingsGoal.user_id == current_user.id)
        .first()
    )
    if goal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Savings goal not found")
    data = payload.model_dump(exclude_unset=True)
    if data.get("is_emergency_fund") and not goal.is_emergency_fund:
        existing = (
            db.query(SavingsGoal)
            .filter(
                SavingsGoal.user_id == current_user.id,
                SavingsGoal.is_emergency_fund,
            )
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Only one emergency fund is allowed",
            )
    for field, value in data.items():
        setattr(goal, field, value)
    db.commit()
    db.refresh(goal)
    return goal


@router.delete("/{goal_id}")
def delete_savings_goal(current_user: CurrentUserDep, db: DbDep, goal_id: str) -> dict:
    goal = (
        db.query(SavingsGoal)
        .filter(SavingsGoal.id == goal_id, SavingsGoal.user_id == current_user.id)
        .first()
    )
    if goal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Savings goal not found")
    db.delete(goal)
    db.commit()
    return {"success": True}


@router.post("/{goal_id}/contribute", response_model=SavingsGoalOut)
def contribute(
    current_user: CurrentUserDep,
    db: DbDep,
    goal_id: str,
    payload: ContributionRequest,
) -> SavingsGoal:
    goal = (
        db.query(SavingsGoal)
        .filter(SavingsGoal.id == goal_id, SavingsGoal.user_id == current_user.id)
        .first()
    )
    if goal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Savings goal not found")
    goal.current_amount += payload.amount
    db.commit()
    db.refresh(goal)
    return goal


@router.post("/{goal_id}/withdraw", response_model=SavingsGoalOut)
def withdraw(
    current_user: CurrentUserDep,
    db: DbDep,
    goal_id: str,
    payload: WithdrawRequest,
) -> SavingsGoal:
    goal = (
        db.query(SavingsGoal)
        .filter(SavingsGoal.id == goal_id, SavingsGoal.user_id == current_user.id)
        .first()
    )
    if goal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Savings goal not found")
    if payload.amount > goal.current_amount:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Cannot withdraw more than current amount",
        )
    goal.current_amount -= payload.amount
    db.commit()
    db.refresh(goal)
    return goal
