from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.deps import get_current_user
from src.models.location import Location
from src.models.user import User
from src.schemas.radar import LocationUpdate

import uuid
from geoalchemy2.elements import WKTElement
from sqlalchemy import select

router = APIRouter()


@router.post("/location", status_code=status.HTTP_204_NO_CONTENT)
async def update_location(
    body: LocationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    point = WKTElement(f"POINT({body.lng} {body.lat})", srid=4326)

    result = await db.execute(
        select(Location).where(Location.user_id == current_user.id)
    )
    loc = result.scalar_one_or_none()

    if loc:
        loc.geom       = point
        loc.accuracy_m = body.accuracy_m
        loc.visibility = body.visibility
    else:
        db.add(Location(
            user_id    = current_user.id,
            geom       = point,
            accuracy_m = body.accuracy_m,
            visibility = body.visibility,
        ))

    await db.commit()
