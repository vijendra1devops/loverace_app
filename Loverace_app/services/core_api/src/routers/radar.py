from fastapi import APIRouter, Depends, Query
import asyncpg

from src.database import get_pool
from src.deps import get_current_user
from src.models.user import User
from src.schemas.radar import RadarResponse
from src.services.radar_service import RadarService

router = APIRouter()

MIN_RADIUS = 100
MAX_RADIUS = 5_000


@router.get("/radar", response_model=RadarResponse)
async def get_radar(
    lat:    float = Query(..., ge=-90,   le=90),
    lng:    float = Query(..., ge=-180,  le=180),
    radius: float = Query(1_000, ge=MIN_RADIUS, le=MAX_RADIUS, description="Radius in metres"),
    current_user: User  = Depends(get_current_user),
    pool:         asyncpg.Pool = Depends(get_pool),
):
    svc   = RadarService(pool, str(current_user.id))
    users = await svc.get_nearby(lat, lng, radius)
    return RadarResponse(users=users, count=len(users))
