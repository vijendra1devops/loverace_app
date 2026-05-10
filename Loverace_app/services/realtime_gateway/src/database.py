import asyncpg
from fastapi import HTTPException
from src.config import settings

_pool: asyncpg.Pool | None = None


async def get_pool() -> asyncpg.Pool:
    global _pool
    if not settings.ASYNCPG_URL or not settings.ASYNCPG_URL.startswith("postgres"):
        raise HTTPException(status_code=503, detail="Postgres asyncpg pool not configured. Set ASYNCPG_URL to enable realtime features.")

    if _pool is None:
        _pool = await asyncpg.create_pool(
            settings.ASYNCPG_URL,
            min_size=2,
            max_size=15,
        )
    return _pool


async def close_pool() -> None:
    global _pool
    if _pool:
        await _pool.close()
        _pool = None
