"""User profile endpoints."""

import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.core.security import hash_password, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import (
    ChangePasswordRequest,
    UpdateApiKeyRequest,
    UpdateProfileRequest,
    UserResponse,
)

router = APIRouter()
logger = structlog.get_logger(__name__)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_active_user)) -> UserResponse:
    return UserResponse.model_validate(current_user)


@router.patch("/me", response_model=UserResponse)
async def update_profile(
    payload: UpdateProfileRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    repo = UserRepository(db)
    updates = payload.model_dump(exclude_none=True)
    user = await repo.update(current_user, **updates)
    return UserResponse.model_validate(user)


@router.post("/me/change-password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")
    repo = UserRepository(db)
    await repo.update(current_user, hashed_password=hash_password(payload.new_password))


@router.post("/me/api-keys", status_code=status.HTTP_204_NO_CONTENT)
async def update_api_keys(
    payload: UpdateApiKeyRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    repo = UserRepository(db)
    await repo.update(current_user, gemini_api_key=payload.gemini_api_key)


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    repo = UserRepository(db)
    await repo.delete(current_user)
    logger.info("User deleted account", user_id=current_user.id)
