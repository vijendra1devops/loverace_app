"""
Loverace — realtime_gateway (Microservice B)
WebSocket hub + PostgreSQL LISTEN/NOTIFY subscriber.

Port: 8001
"""
import asyncio
import json
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect

from src.config import settings
from src.database import get_pool, close_pool
from src.deps import authenticate_ws
from src.handlers.chat import handle_message
from src.handlers.bond import handle_bond_confirm
from src.handlers.presence import broadcast_online, broadcast_offline, handle_typing
from src.handlers.pg_listener import pg_listener
from src.ws.connection_manager import manager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

_listener_task: asyncio.Task | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _listener_task
    if settings.ASYNCPG_URL and settings.ASYNCPG_URL.startswith("postgres"):
        pool = await get_pool()
        _listener_task = asyncio.create_task(pg_listener(pool))
        logger.info("realtime_gateway started with Postgres listener.")
    else:
        logger.info("realtime_gateway started without Postgres (ASYNCPG_URL not configured).")
    yield
    if _listener_task:
        _listener_task.cancel()
    if settings.ASYNCPG_URL and settings.ASYNCPG_URL.startswith("postgres"):
        await close_pool()
    logger.info("realtime_gateway stopped.")


app = FastAPI(
    title="Loverace Realtime Gateway",
    version="0.1.0",
    description="WebSocket hub for chat, bond XP, presence, and radar push.",
    lifespan=lifespan,
)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "realtime_gateway", "online_users": len(manager.online_user_ids())}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    Single WebSocket endpoint.  JWT is passed as ?token=<JWT>

    Supported inbound event types:
        message.send     – send a chat message
        typing.start     – broadcast typing indicator
        bond.confirm     – confirm a bond stage upgrade
        ping             – keep-alive
    """
    user_id = await authenticate_ws(websocket)
    # If Postgres is not configured, decline realtime/WebSocket functionality
    if not (settings.ASYNCPG_URL and settings.ASYNCPG_URL.startswith("postgres")):
        await websocket.accept()
        await websocket.send_text(json.dumps({"type": "error", "detail": "Realtime not available: ASYNCPG_URL not configured"}))
        await websocket.close()
        return

    pool    = await get_pool()

    await manager.connect(user_id, websocket)
    await broadcast_online(pool, user_id)
    logger.info("User %s connected. Online: %d", user_id, len(manager.online_user_ids()))

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                payload = json.loads(raw)
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({"type": "error", "detail": "Invalid JSON"}))
                continue

            event_type = payload.get("type", "")

            if event_type == "message.send":
                await handle_message(pool, user_id, payload)

            elif event_type == "typing.start":
                await handle_typing(pool, user_id, payload)

            elif event_type == "bond.confirm":
                await handle_bond_confirm(pool, user_id, payload)

            elif event_type == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))

            else:
                await websocket.send_text(json.dumps({
                    "type":   "error",
                    "detail": f"Unknown event type: {event_type}",
                }))

    except WebSocketDisconnect:
        pass
    except Exception as exc:
        logger.exception("WebSocket error for user %s: %s", user_id, exc)
    finally:
        await manager.disconnect(user_id, websocket)
        await broadcast_offline(pool, user_id)
        logger.info("User %s disconnected. Online: %d", user_id, len(manager.online_user_ids()))
