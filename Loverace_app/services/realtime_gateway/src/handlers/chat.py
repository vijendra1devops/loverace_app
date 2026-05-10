"""
Chat handler — receives a message from the WebSocket, persists it, awards XP,
then delivers it to the other participant in the conversation.
"""
import json
import uuid

import asyncpg

from src.bond.xp_engine import process_message_xp
from src.ws.connection_manager import manager


async def handle_message(
    pool: asyncpg.Pool,
    sender_id: str,
    payload: dict,
) -> None:
    """
    Expected payload:
        { "type": "message.send",
          "conversation_id": "<uuid>",
          "text": "..." }
    """
    conversation_id: str | None = payload.get("conversation_id")
    text: str                   = (payload.get("text") or "").strip()

    if not conversation_id or not text:
        return

    # Fetch the other participant
    async with pool.acquire() as conn:
        # Validate sender is part of the conversation
        row = await conn.fetchrow(
            """
            SELECT c.id, m.user_a_id::text, m.user_b_id::text
            FROM   conversations c
            JOIN   matches m ON m.id = c.match_id
            WHERE  c.id = $1::uuid
              AND  (m.user_a_id = $2::uuid OR m.user_b_id = $2::uuid)
              AND  m.is_active = TRUE
            """,
            conversation_id,
            sender_id,
        )
        if not row:
            await manager.send(sender_id, {
                "type":   "error",
                "code":   "UNAUTHORIZED",
                "detail": "Not a participant in this conversation",
            })
            return

        other_user_id = row["user_b_id"] if row["user_a_id"] == sender_id else row["user_a_id"]

        # Persist the message
        msg_id = str(uuid.uuid4())
        await conn.execute(
            """
            INSERT INTO messages (id, conversation_id, sender_id, text)
            VALUES ($1::uuid, $2::uuid, $3::uuid, $4)
            """,
            msg_id,
            conversation_id,
            sender_id,
            text,
        )

    # Award XP (async, own connection)
    xp_result = await process_message_xp(pool, conversation_id, sender_id, text)

    # Ack to sender
    await manager.send(sender_id, {
        "type":           "message.ack",
        "message_id":     msg_id,
        "conversation_id": conversation_id,
        "xp_awarded":     xp_result["xp_awarded"],
        "rate_limited":   xp_result["rate_limited"],
        "bond": {
            "level":                xp_result["level"],
            "stage":                xp_result["stage"],
            "stage_name":           xp_result["stage_name"],
            "words_to_next_level":  xp_result["words_to_next_level"],
            "pending_confirmation": xp_result["pending_confirmation"],
        },
    })

    # Deliver to recipient
    await manager.send(other_user_id, {
        "type":            "message.received",
        "message_id":      msg_id,
        "conversation_id": conversation_id,
        "sender_id":       sender_id,
        "text":            text,
    })
