from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Leave empty for local development if you don't run Postgres locally.
    ASYNCPG_URL: str = ""

    # JWT (must match core_api)
    JWT_SECRET:    str = "changeme_replace_with_32_plus_chars_in_prod"
    JWT_ALGORITHM: str = "HS256"

    # PostgreSQL LISTEN/NOTIFY channels
    PG_NOTIFY_CHANNEL:  str = "loverace_events"
    BOND_NOTIFY_CHANNEL: str = "bond_updates"

    # Bond XP engine tuning
    XP_LOCK_SECONDS: int = 10
    XP_CAP_PER_MSG:  int = 30


settings = Settings()
