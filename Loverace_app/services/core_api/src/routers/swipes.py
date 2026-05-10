from fastapi import APIRouter, Depends, status
import asyncpg

from src.database import get_db, get_pool
from src.deps import get_current_user
from src.models.user import User
from src.schemas.swipe import SwipeRequest, SwipeResponse
from src.services.swipe_service import SwipeService
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


@router.post("/swipes", response_model=SwipeResponse, status_code=status.HTTP_201_CREATED)
async def record_swipe(
    body:         SwipeRequest,
    current_user: User = Depends(get_current_user),
    db:           AsyncSession = Depends(get_db),
    pool:         asyncpg.Pool = Depends(get_pool),
):
    svc = SwipeService(db, pool, str(current_user.id))
    result = await svc.record_swipe(body.to_user_id, body.direction, body.source)
    return SwipeResponse(**result)


@router.post("/swipes/undo", status_code=status.HTTP_204_NO_CONTENT)
async def undo_swipe(
    current_user: User = Depends(get_current_user),
    db:           AsyncSession = Depends(get_db),
    pool:         asyncpg.Pool = Depends(get_pool),
):
    svc = SwipeService(db, pool, str(current_user.id))
    await svc.undo_last_swipe()
