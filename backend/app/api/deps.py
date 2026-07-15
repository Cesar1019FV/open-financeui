"""Shared API dependencies."""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token, oauth2_scheme
from app.models.user import User

DbDep = Annotated[Session, Depends(get_db)]


def get_current_user(db: DbDep, token: Annotated[str, Depends(oauth2_scheme)]) -> User:
    user_id = decode_access_token(token)
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


CurrentUserDep = Annotated[User, Depends(get_current_user)]


def get_current_user_optional(
    db: DbDep, token: Annotated[str | None, Depends(oauth2_scheme)]
) -> User | None:
    if token is None:
        return None
    try:
        return get_current_user(db, token)
    except HTTPException:
        return None


OptionalUserDep = Annotated[User | None, Depends(get_current_user_optional)]
