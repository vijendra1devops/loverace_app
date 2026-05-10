"""
In-process WebSocket connection manager.

For multi-instance AKS deployments, wire this to a shared presence table
in PostgreSQL (ws_connections) instead of the in-memory dict.
The current implementation is correct for single-replica or sticky-session setups.
"""
import asyncio
import json
from collections import defaultdict
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        # user_id -> list of active WebSocket connections (multiple tabs / devices)
        self._connections: dict[str, list[WebSocket]] = defaultdict(list)
        self._lock = asyncio.Lock()

    async def connect(self, user_id: str, ws: WebSocket) -> None:
        await ws.accept()
        async with self._lock:
            self._connections[user_id].append(ws)

    async def disconnect(self, user_id: str, ws: WebSocket) -> None:
        async with self._lock:
            conns = self._connections.get(user_id, [])
            if ws in conns:
                conns.remove(ws)
            if not conns:
                self._connections.pop(user_id, None)

    async def send(self, user_id: str, payload: dict) -> None:
        """Send a JSON payload to all connections for a user (best-effort)."""
        async with self._lock:
            sockets = list(self._connections.get(user_id, []))
        dead = []
        for ws in sockets:
            try:
                await ws.send_text(json.dumps(payload))
            except Exception:
                dead.append(ws)
        for ws in dead:
            await self.disconnect(user_id, ws)

    def is_online(self, user_id: str) -> bool:
        return bool(self._connections.get(user_id))

    def online_user_ids(self) -> list[str]:
        return list(self._connections.keys())


# Single shared instance used by the whole process
manager = ConnectionManager()
