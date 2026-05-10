"""
Bond handler — processes bond.confirm events from a WebSocket client.
"""
import asyncpg

from src.bond.xp_engine import confirm_stage_upgrade
from src.ws.connection_manager import manager


async def handle_bond_confirm(
    pool: asyncpg.Pool,
    user_id: str,
    payload: dict,
) -> None:
    """
    Expected payload:
        { "type": "bond.confirm", "conversation_id": "<uuid>" }
    """
    conversation_id: str | None = payload.get("conversation_id")
    if not conversation_id:
        return

    result = await confirm_stage_upgrade(pool, conversation_id, user_id)

    await manager.send(user_id, {
        "type":                 "bond.confirm.ack",
        "conversation_id":      conversation_id,
        "level":                result["level"],
        "stage":                result["stage"],
        "stage_name":           result["stage_name"],
        "pending_confirmation": result["pending_confirmation"],
    })
