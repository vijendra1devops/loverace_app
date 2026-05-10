from fastapi import APIRouter, Depends, Query
from typing import Any
import asyncpg

from src.database import get_pool
from src.deps import get_current_user
from src.models.user import User

router = APIRouter()


@router.get("/matches")
async def list_matches(
    current_user: User = Depends(get_current_user),
    pool:         asyncpg.Pool = Depends(get_pool),
) -> dict[str, Any]:
    rows = await pool.fetch(
        """
        SELECT
            m.id::text                                                   AS match_id,
            CASE WHEN m.user_a_id = $1::uuid THEN m.user_b_id
                 ELSE m.user_a_id END::text                             AS other_user_id,
            p.display_name,
            p.photos,
            c.id::text                                                   AS conversation_id,
            m.matched_at
        FROM   matches      m
        JOIN   conversations c ON c.match_id = m.id
        JOIN   profiles      p ON p.user_id  =
               CASE WHEN m.user_a_id = $1::uuid THEN m.user_b_id
                    ELSE m.user_a_id END
        WHERE  (m.user_a_id = $1::uuid OR m.user_b_id = $1::uuid)
          AND  m.is_active = TRUE
        ORDER  BY m.matched_at DESC
        """,
        str(current_user.id),
    )

    matches = []
    for row in rows:
        photos = row["photos"] or []
        matches.append({
            "match_id":        row["match_id"],
            "other_user_id":   row["other_user_id"],
            "display_name":    row["display_name"],
            "avatar_url":      photos[0].get("url") if photos else None,
            "conversation_id": row["conversation_id"],
            "matched_at":      str(row["matched_at"]),
        })

    return {"matches": matches, "count": len(matches)}


@router.get("/likes/received")
async def who_liked_me(
    current_user: User = Depends(get_current_user),
    pool:         asyncpg.Pool = Depends(get_pool),
) -> dict[str, Any]:
    """Return users who swiped right on the current user but no mutual match yet."""
    rows = await pool.fetch(
        """
        SELECT
            s.from_user_id::text AS user_id,
            p.display_name,
            p.photos,
            s.created_at
        FROM   swipes   s
        JOIN   profiles p ON p.user_id = s.from_user_id
        WHERE  s.to_user_id = $1::uuid
          AND  s.direction IN ('like', 'superlike')
          AND  NOT EXISTS (
                   SELECT 1 FROM swipes s2
                   WHERE  s2.from_user_id = $1::uuid
                     AND  s2.to_user_id   = s.from_user_id
               )
        ORDER  BY s.created_at DESC
        """,
        str(current_user.id),
    )

    results = []
    for row in rows:
        photos = row["photos"] or []
        results.append({
            "user_id":      row["user_id"],
            "display_name": row["display_name"],
            "avatar_url":   photos[0].get("url") if photos else None,
            "liked_at":     str(row["created_at"]),
        })

    return {"likes": results, "count": len(results)}


@router.post("/matches/{match_id}/block", status_code=204)
async def block_match(
    match_id:     str,
    current_user: User = Depends(get_current_user),
    pool:         asyncpg.Pool = Depends(get_pool),
) -> None:
    await pool.execute(
        """
        UPDATE matches
        SET blocked_by_a = CASE WHEN user_a_id = $2::uuid THEN TRUE ELSE blocked_by_a END,
            blocked_by_b = CASE WHEN user_b_id = $2::uuid THEN TRUE ELSE blocked_by_b END,
            is_active    = FALSE
        WHERE id = $1::uuid
          AND (user_a_id = $2::uuid OR user_b_id = $2::uuid)
        """,
        match_id,
        str(current_user.id),
    )
