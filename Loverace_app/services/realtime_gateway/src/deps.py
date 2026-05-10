"""JWT validation for WebSocket connections.

Clients pass the JWT as a query parameter:  wss://host/ws?token=<JWT>
"""
from fastapi import WebSocket, WebSocketException, status
from jose import JWTError, jwt

from src.config import settings


async def authenticate_ws(websocket: WebSocket) -> str:
    """Return user_id (str) or close the socket with 4001 if token is invalid."""
    token: str | None = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4001, reason="Missing token")
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)

    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id: str | None = payload.get("sub")
        if not user_id:
            raise ValueError("No sub")
    except (JWTError, ValueError):
        await websocket.close(code=4001, reason="Invalid token")
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)

    return user_id
