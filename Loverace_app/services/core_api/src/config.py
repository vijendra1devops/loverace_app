from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database
    # Default to a local SQLite DB for quick development. In production,
    # set `DATABASE_URL` to a PostgreSQL URI (e.g. postgresql+asyncpg://user:pass@host/db).
    DATABASE_URL: str = "sqlite+aiosqlite:///./dev.db"
    # ASYNCPG_URL is used to create a raw asyncpg pool for Postgres-specific
    # features (LISTEN/NOTIFY, PostGIS queries). Leave empty in dev to
    # disable Postgres-only functionality.
    ASYNCPG_URL: Optional[str] = ""

    # JWT
    JWT_SECRET: str = "changeme_replace_with_32_plus_chars_in_prod"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_MINUTES: int = 60

    # S3 / MinIO
    S3_ENDPOINT: Optional[str] = None
    S3_BUCKET: str = "loverace-media"
    S3_ACCESS_KEY: str = "minioadmin"
    S3_SECRET_KEY: str = "minioadmin"

    # Feature flags
    MODERATION_ENABLED: bool = False
    DEBUG: bool = True

    # Inter-service events (PostgreSQL NOTIFY channel)
    PG_NOTIFY_CHANNEL: str = "loverace_events"


settings = Settings()


def using_postgres(settings: Settings) -> bool:
    """Return True when ASYNCPG_URL looks like a Postgres URL.

    This helper is useful for startup checks and conditional initialization
    of Postgres-only features.
    """
    return bool(settings.ASYNCPG_URL) and settings.ASYNCPG_URL.startswith("postgres")
