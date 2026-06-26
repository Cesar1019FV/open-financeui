"""Authentication endpoints."""

from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import CurrentUserDep, DbDep
from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User, UserPreference
from app.schemas.auth import RegisterRequest, Token
from app.schemas.user import UserOut
from app.services.seed import create_default_categories

router = APIRouter(prefix="/auth", tags=["auth"])


def _create_user_with_defaults(db: Session, email: str, password: str) -> User:
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(email=email, hashed_password=get_password_hash(password))
    db.add(user)
    db.flush()

    preference = UserPreference(user_id=user.id)
    db.add(preference)
    create_default_categories(db, user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(db: DbDep, payload: RegisterRequest) -> User:
    user = _create_user_with_defaults(db, payload.email, payload.password)
    return user


@router.post("/login", response_model=Token)
def login(db: DbDep, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]) -> dict:
    user = db.query(User).filter(User.email == form_data.username).first()
    if user is None or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        subject=user.id, expires_delta=timedelta(days=settings.access_token_expire_days)
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
def me(current_user: CurrentUserDep) -> User:
    return current_user
