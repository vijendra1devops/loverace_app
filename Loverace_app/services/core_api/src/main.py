from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.database import engine, get_pg_pool, close_pg_pool
from src import models  # noqa: F401 – registers all ORM models with Base.metadata
from src.database import Base
from src.config import settings
from src.routers import auth, profiles, location, radar, feed, swipes, matches


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables (idempotent – safe for development; use Alembic in production)
    # When running with SQLite in dev we skip `create_all` because several
    # models use Postgres-only types (ARRAY/JSONB) which cannot be compiled
    # for SQLite. In dev we expect the minimal schema to be created by the
    # direct sqlite helper script or by migrations in a Postgres environment.
    if not settings.DATABASE_URL.startswith("sqlite"):
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    # Warm up asyncpg pool if configured (Postgres only)
    if settings.ASYNCPG_URL and settings.ASYNCPG_URL.startswith("postgres"):
        await get_pg_pool()

    yield

    if settings.ASYNCPG_URL and settings.ASYNCPG_URL.startswith("postgres"):
        await close_pg_pool()

    await engine.dispose()


app = FastAPI(
    title="Loverace Core API",
    version="0.1.0",
    description="Auth, profiles, radar, swipes, and matches.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Restrict to your frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,     prefix="/v1/auth",     tags=["auth"])
app.include_router(profiles.router, prefix="/v1/profiles", tags=["profiles"])
app.include_router(location.router, prefix="/v1",          tags=["location"])
app.include_router(radar.router,    prefix="/v1",          tags=["radar"])
app.include_router(feed.router,     prefix="/v1",          tags=["feed"])
app.include_router(swipes.router,   prefix="/v1",          tags=["swipes"])
app.include_router(matches.router,  prefix="/v1",          tags=["matches"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "core_api"}
