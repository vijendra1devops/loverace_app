"""
PostgreSQL LISTEN/NOTIFY subscriber.

Listens on two channels:
  - loverace_events  : published by core_api (match.created, etc.)
  - bond_updates     : published by xp_engine (bond.progress, bond.stage_upgraded)

Runs as a background asyncio task started in app lifespan.
"""
import asyncio
import json
import logging

import asyncpg

from src.config import settings
from src.ws.connection_manager import manager

logger = logging.getLogger(__name__)


async def pg_listener(pool: asyncpg.Pool) -> None:
    """
    Long-running coroutine that holds a dedicated asyncpg connection and
    dispatches NOTIFY payloads to WebSocket clients.
    """
    while True:
        try:
            conn: asyncpg.Connection = await asyncpg.connect(settings.ASYNCPG_URL)

            async def _dispatch(conn, pid, channel, payload_str):
                try:
                    payload = json.loads(payload_str)
                    event   = payload.get("event") or payload.get("type", "")
                    await _route(event, payload)
                except Exception as exc:
                    logger.warning("Failed to dispatch notify payload: %s", exc)

            await conn.add_listener(settings.PG_NOTIFY_CHANNEL, _dispatch)
            await conn.add_listener(settings.BOND_NOTIFY_CHANNEL, _dispatch)
            logger.info("PG LISTEN active on '%s' and '%s'",
                        settings.PG_NOTIFY_CHANNEL, settings.BOND_NOTIFY_CHANNEL)

            # Block forever until connection drops
            while not conn.is_closed():
                await asyncio.sleep(5)

        except (asyncpg.PostgresConnectionStatusError, OSError) as exc:
            logger.warning("PG listener lost connection (%s). Reconnecting in 3s…", exc)
            await asyncio.sleep(3)
        except asyncio.CancelledError:
            logger.info("PG listener shutting down.")
            break
        except Exception as exc:
            logger.exception("Unexpected PG listener error: %s", exc)
            await asyncio.sleep(3)


async def _route(event: str, payload: dict) -> None:
    """Fan-out a pg_notify payload to the relevant WebSocket clients."""

    if event == "match.created":
        for uid in (payload.get("user_a"), payload.get("user_b")):
            if uid:
                await manager.send(uid, {
                    "type":            "match.created",
                    "match_id":        payload.get("match_id"),
                    "conversation_id": payload.get("conversation_id"),
                    "other_user_id":   payload.get("user_b") if uid == payload.get("user_a")
                                       else payload.get("user_a"),
                })

    elif event in ("bond.progress", "bond.stage_upgraded"):
        uid = payload.get("user_id")
        if uid:
            await manager.send(uid, payload)
