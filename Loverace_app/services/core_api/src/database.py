from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
)
from sqlalchemy.orm import DeclarativeBase
from typing import AsyncGenerator
import asyncpg
from fastapi import HTTPException

from src.config import settings

# ---------------------------------------------------------------------------
# SQLAlchemy async engine + session (for ORM operations)
# ---------------------------------------------------------------------------
# Use a different engine configuration when using SQLite locally vs Postgres.
if settings.DATABASE_URL.startswith("sqlite"):
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=settings.DEBUG,
        connect_args={"check_same_thread": False},
    )
else:
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=settings.DEBUG,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
    )

AsyncSessionLocal = async_sessionmaker(
    engine,
    expire_on_commit=False,
    class_=AsyncSession,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise


# ---------------------------------------------------------------------------
# Raw asyncpg pool (for pg_notify, geospatial queries, bond engine)
# ---------------------------------------------------------------------------
# The asyncpg pool is optional in development when you use SQLite. When
# `ASYNCPG_URL` is unset or not a Postgres URL, the pool functions will
# return None (and route dependencies will raise a 503 if they try to use it).
_pg_pool: asyncpg.Pool | None = None


async def get_pg_pool() -> asyncpg.Pool | None:
    global _pg_pool
    if _pg_pool is None:
        if not settings.ASYNCPG_URL or not settings.ASYNCPG_URL.startswith("postgres"):
            return None
        _pg_pool = await asyncpg.create_pool(
            settings.ASYNCPG_URL,
            min_size=2,
            max_size=10,
        )
    return _pg_pool


async def close_pg_pool() -> None:
    global _pg_pool
    if _pg_pool:
        await _pg_pool.close()
        _pg_pool = None


# ---------------------------------------------------------------------------
# Dependency helper so routers can inject the asyncpg pool
# ---------------------------------------------------------------------------
async def get_pool() -> asyncpg.Pool:
    pool = await get_pg_pool()
    if pool is None:
        raise HTTPException(status_code=503, detail="Postgres asyncpg pool not configured. Set ASYNCPG_URL for Postgres features.")
    return pool
