from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.deps import get_current_user
from src.models.user import User
from src.schemas.profile import ProfileResponse, ProfileUpdate
from src.services.profile_service import ProfileService

router = APIRouter()


@router.get("/me", response_model=ProfileResponse)
async def get_own_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await ProfileService(db).get_profile(str(current_user.id))


@router.get("/{user_id}", response_model=ProfileResponse)
async def get_profile(
    user_id: str,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await ProfileService(db).get_profile(user_id)


@router.patch("/me", response_model=ProfileResponse)
async def update_profile(
    body: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await ProfileService(db).update_profile(str(current_user.id), body)
