"""
Presence handler — broadcasts online/offline status changes to matches.
"""
import asyncpg

from src.ws.connection_manager import manager


async def broadcast_online(pool: asyncpg.Pool, user_id: str) -> None:
    await _broadcast_status(pool, user_id, online=True)


async def broadcast_offline(pool: asyncpg.Pool, user_id: str) -> None:
    await _broadcast_status(pool, user_id, online=False)


async def handle_typing(
    pool: asyncpg.Pool,
    user_id: str,
    payload: dict,
) -> None:
    """
    Expected payload:
        { "type": "typing.start", "conversation_id": "<uuid>" }
    """
    conversation_id: str | None = payload.get("conversation_id")
    if not conversation_id:
        return

    other_user_id = await _get_other_participant(pool, conversation_id, user_id)
    if other_user_id:
        await manager.send(other_user_id, {
            "type":            "typing.indicator",
            "conversation_id": conversation_id,
            "user_id":         user_id,
        })


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------
async def _broadcast_status(pool: asyncpg.Pool, user_id: str, online: bool) -> None:
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT CASE WHEN m.user_a_id = $1::uuid THEN m.user_b_id
                        ELSE m.user_a_id END::text AS other_id
            FROM   matches m
            WHERE  (m.user_a_id = $1::uuid OR m.user_b_id = $1::uuid)
              AND  m.is_active = TRUE
            """,
            user_id,
        )
    for row in rows:
        await manager.send(row["other_id"], {
            "type":    "presence.update",
            "user_id": user_id,
            "online":  online,
        })


async def _get_other_participant(
    pool: asyncpg.Pool, conversation_id: str, user_id: str
) -> str | None:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT CASE WHEN m.user_a_id = $2::uuid THEN m.user_b_id
                        ELSE m.user_a_id END::text AS other_id
            FROM   conversations c
            JOIN   matches m ON m.id = c.match_id
            WHERE  c.id = $1::uuid
              AND  (m.user_a_id = $2::uuid OR m.user_b_id = $2::uuid)
            """,
            conversation_id,
            user_id,
        )
    return row["other_id"] if row else None
