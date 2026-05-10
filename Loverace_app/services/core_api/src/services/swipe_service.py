import json
import uuid

import asyncpg
from fastapi import HTTPException, status
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.config import settings
from src.models.bond_progress import BondProgress
from src.models.conversation import Conversation
from src.models.match import Match
from src.models.swipe import Swipe


class SwipeService:
    def __init__(self, db: AsyncSession, pool: asyncpg.Pool, current_user_id: str) -> None:
        self.db = db
        self.pool = pool
        self.current_user_id = current_user_id

    async def record_swipe(self, to_user_id: str, direction: str, source: str) -> dict:
        uid_from = uuid.UUID(self.current_user_id)
        uid_to   = uuid.UUID(to_user_id)

        # Idempotency — return existing swipe silently
        existing = await self.db.execute(
            select(Swipe).where(
                and_(Swipe.from_user_id == uid_from, Swipe.to_user_id == uid_to)
            )
        )
        if existing.scalar_one_or_none():
            return {"swipe_id": "", "match_created": False, "match_id": None, "conversation_id": None}

        swipe = Swipe(from_user_id=uid_from, to_user_id=uid_to, direction=direction, source=source)
        self.db.add(swipe)
        await self.db.flush()

        match_created   = False
        match_id        = None
        conv_id         = None
        notify_user_a   = None
        notify_user_b   = None

        if direction in ("like", "superlike"):
            # Check for reciprocal like
            reciprocal = await self.db.execute(
                select(Swipe).where(
                    and_(
                        Swipe.from_user_id == uid_to,
                        Swipe.to_user_id   == uid_from,
                        Swipe.direction.in_(["like", "superlike"]),
                    )
                )
            )
            if reciprocal.scalar_one_or_none():
                # Canonical ordering: user_a < user_b (prevents duplicate matches)
                u_a, u_b = sorted([self.current_user_id, to_user_id])
                uid_a, uid_b = uuid.UUID(u_a), uuid.UUID(u_b)

                already = await self.db.execute(
                    select(Match).where(and_(Match.user_a_id == uid_a, Match.user_b_id == uid_b))
                )
                if not already.scalar_one_or_none():
                    match = Match(user_a_id=uid_a, user_b_id=uid_b)
                    self.db.add(match)
                    await self.db.flush()

                    conv = Conversation(match_id=match.id)
                    self.db.add(conv)
                    await self.db.flush()

                    # Seed bond_progress for both users (stage 1, level 1, xp 0)
                    for uid in [uid_a, uid_b]:
                        self.db.add(BondProgress(conversation_id=conv.id, user_id=uid))

                    match_created = True
                    match_id      = str(match.id)
                    conv_id       = str(conv.id)
                    notify_user_a = u_a
                    notify_user_b = u_b

        await self.db.commit()

        # Notify realtime_gateway via pg_notify (fire and forget)
        if match_created:
            async with self.pool.acquire() as conn:
                await conn.execute(
                    "SELECT pg_notify($1, $2)",
                    settings.PG_NOTIFY_CHANNEL,
                    json.dumps({
                        "type":            "match.created",
                        "match_id":        match_id,
                        "conversation_id": conv_id,
                        "user_a":          notify_user_a,
                        "user_b":          notify_user_b,
                    }),
                )

        return {
            "swipe_id":        str(swipe.id),
            "match_created":   match_created,
            "match_id":        match_id,
            "conversation_id": conv_id,
        }

    async def undo_last_swipe(self) -> bool:
        """Delete the most recent swipe by current user (within 30 s window)."""
        result = await self.db.execute(
            select(Swipe)
            .where(Swipe.from_user_id == uuid.UUID(self.current_user_id))
            .order_by(Swipe.created_at.desc())
            .limit(1)
        )
        swipe = result.scalar_one_or_none()
        if not swipe:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No swipe to undo")

        from datetime import datetime, timezone, timedelta
        if datetime.now(timezone.utc) - swipe.created_at.replace(tzinfo=timezone.utc) > timedelta(seconds=30):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Undo window expired (30 s)")

        await self.db.delete(swipe)
        await self.db.commit()
        return True
