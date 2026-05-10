"""FastAPI dependencies shared across routers."""
import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, cast, String

from src.config import settings, using_postgres
from src.database import get_db
from src.models.user import User

_bearer = HTTPBearer()


async def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(_bearer),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Decode JWT and return the active User record."""
    token = creds.credentials
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        user_id: str | None = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    # When running against SQLite in dev we store UUIDs as text strings.
    # Postgres expects real UUID objects; use the configured DB type to
    # decide how to compare the value.
    if using_postgres(settings):
        lookup_id = uuid.UUID(user_id)
        result = await db.execute(select(User).where(User.id == lookup_id))
    else:
        lookup_id = str(user_id)
        # SQLite stores UUIDs as text; cast the UUID column to string for comparison.
        result = await db.execute(select(User).where(cast(User.id, String) == lookup_id))
    user = result.scalar_one_or_none()
    if not user or user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    return user
