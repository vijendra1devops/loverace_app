"""
Swipe feed – returns a ranked deck of profiles the current user has not
yet swiped on, filtered by recent activity (last 7 days).
Preferences stored in profiles.preferences can narrow the results further.
"""
from fastapi import APIRouter, Depends, Query
from typing import Any
import asyncpg

from src.database import get_pool
from src.deps import get_current_user
from src.models.user import User

router = APIRouter()


@router.get("/feed")
async def get_feed(
    limit:        int  = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    pool:         asyncpg.Pool = Depends(get_pool),
) -> dict[str, Any]:
    rows = await pool.fetch(
        """
        SELECT
            u.id::text          AS user_id,
            p.display_name,
            p.photos,
            p.date_of_birth,
            p.gender_identity,
            p.pronouns,
            p.bio,
            p.interests,
            p.sexual_orientation,
            p.looking_for
        FROM   users    u
        JOIN   profiles p ON p.user_id = u.id
        WHERE  u.id::text != $1
          AND  u.status = 'active'
          AND  u.last_active > NOW() - INTERVAL '7 days'
          AND  u.id NOT IN (
                   SELECT to_user_id
                   FROM   swipes
                   WHERE  from_user_id = $1::uuid
               )
        ORDER  BY u.last_active DESC
        LIMIT  $2
        """,
        str(current_user.id),
        limit,
    )

    cards = []
    for row in rows:
        photos: list = row["photos"] or []
        cards.append({
            "user_id":         row["user_id"],
            "display_name":    row["display_name"],
            "avatar_url":      photos[0].get("url") if photos else None,
            "photos":          photos,
            "date_of_birth":   str(row["date_of_birth"]) if row["date_of_birth"] else None,
            "gender_identity": row["gender_identity"],
            "pronouns":        row["pronouns"],
            "bio":             row["bio"],
            "interests":       row["interests"] or [],
            "orientation":     row["sexual_orientation"] or [],
            "looking_for":     row["looking_for"] or [],
        })

    return {"cards": cards, "count": len(cards)}
