"""User and preferences endpoints."""

from fastapi import APIRouter

from app.api.deps import CurrentUserDep, DbDep
from app.models.user import UserPreference
from app.schemas.user import UserOut, UserPreferences, UserPreferencesUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def get_me(current_user: CurrentUserDep) -> UserOut:
    return current_user


@router.get("/me/preferences", response_model=UserPreferences)
def get_preferences(current_user: CurrentUserDep) -> UserPreferences:
    if current_user.preferences is None:
        current_user.preferences = UserPreference(user_id=current_user.id)
    return UserPreferences.model_validate(current_user.preferences)


@router.patch("/me/preferences", response_model=UserPreferences)
def update_preferences(
    current_user: CurrentUserDep, db: DbDep, payload: UserPreferencesUpdate
) -> UserPreferences:
    if current_user.preferences is None:
        current_user.preferences = UserPreference(user_id=current_user.id)
    prefs = current_user.preferences
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(prefs, field, value)
    db.commit()
    db.refresh(prefs)
    return UserPreferences.model_validate(prefs)
