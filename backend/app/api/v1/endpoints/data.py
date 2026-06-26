"""Data management endpoints."""

from fastapi import APIRouter

from app.api.deps import CurrentUserDep, DbDep
from app.services.seed import clear_user_data, reset_user_to_seed

router = APIRouter(prefix="/data", tags=["data"])


@router.post("/reset")
def reset_to_seed(current_user: CurrentUserDep, db: DbDep) -> dict:
    reset_user_to_seed(db, current_user)
    return {"success": True}


@router.post("/clear")
def clear_all(current_user: CurrentUserDep, db: DbDep) -> dict:
    clear_user_data(db, current_user)
    return {"success": True}
