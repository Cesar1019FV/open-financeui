"""Reminders endpoints."""

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUserDep, DbDep
from app.models.reminder import Reminder
from app.schemas.reminder import ReminderCreate, ReminderOut, ReminderUpdate

router = APIRouter(prefix="/reminders", tags=["reminders"])


@router.get("/", response_model=list[ReminderOut])
def list_reminders(current_user: CurrentUserDep, db: DbDep) -> list[Reminder]:
    return (
        db.query(Reminder).filter(Reminder.user_id == current_user.id).order_by(Reminder.date).all()
    )


@router.post("/", response_model=ReminderOut, status_code=status.HTTP_201_CREATED)
def create_reminder(current_user: CurrentUserDep, db: DbDep, payload: ReminderCreate) -> Reminder:
    reminder = Reminder(
        type=payload.type,
        title=payload.title,
        date=payload.date,
        amount=payload.amount,
        currency=payload.currency,
        linked_id=payload.linked_id,
        done=payload.done,
        recurrence=payload.recurrence,
        user_id=current_user.id,
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return reminder


@router.patch("/{reminder_id}", response_model=ReminderOut)
def update_reminder(
    current_user: CurrentUserDep,
    db: DbDep,
    reminder_id: str,
    payload: ReminderUpdate,
) -> Reminder:
    reminder = (
        db.query(Reminder)
        .filter(Reminder.id == reminder_id, Reminder.user_id == current_user.id)
        .first()
    )
    if reminder is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(reminder, field, value)
    db.commit()
    db.refresh(reminder)
    return reminder


@router.delete("/{reminder_id}")
def delete_reminder(current_user: CurrentUserDep, db: DbDep, reminder_id: str) -> dict:
    reminder = (
        db.query(Reminder)
        .filter(Reminder.id == reminder_id, Reminder.user_id == current_user.id)
        .first()
    )
    if reminder is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")
    db.delete(reminder)
    db.commit()
    return {"success": True}


@router.post("/{reminder_id}/mark-done", response_model=ReminderOut)
def mark_done(current_user: CurrentUserDep, db: DbDep, reminder_id: str) -> Reminder:
    reminder = (
        db.query(Reminder)
        .filter(Reminder.id == reminder_id, Reminder.user_id == current_user.id)
        .first()
    )
    if reminder is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")
    reminder.done = True
    db.commit()
    db.refresh(reminder)
    return reminder
