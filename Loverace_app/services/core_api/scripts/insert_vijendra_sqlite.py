#!/usr/bin/env python3
"""
Insert test user 'Vijendra Singh' into the local SQLite dev DB.

Run from the repository root with:
  cd services/core_api
  python scripts/insert_vijendra_sqlite.py

This script uses the project's async SQLAlchemy engine and models.
"""
import asyncio
import os
import sys

# Ensure the services/core_api package is on the import path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from datetime import date

from src.config import settings
from src.database import engine, AsyncSessionLocal, Base
from src.services.auth_service import AuthService
from src.models.user import User
from src.models.settings import UserSettings
from sqlalchemy import select


EMAIL = "vijendra.singh@seed.loverace.dev"
PASSWORD = "love123"
DISPLAY_NAME = "Vijendra Singh"
DOB = date(1988, 5, 5)


async def main() -> None:
    print("Using DATABASE_URL:", settings.DATABASE_URL)

    # Create tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Check for existing user
        result = await session.execute(select(User).where(User.email == EMAIL))
        user = result.scalar_one_or_none()

        if user:
            print("User exists — updating password and flags.")
            user.password_hash = AuthService.hash_password(PASSWORD)
            user.is_verified = True
            user.status = "active"
            session.add(user)
        else:
            print("Creating new user.")
            user = User(
                email=EMAIL,
                password_hash=AuthService.hash_password(PASSWORD),
                is_verified=True,
                status="active",
            )
            session.add(user)
            await session.flush()  # populate user.id for FK rows

            # Create minimal user settings row
            session.add(UserSettings(user_id=user.id))

        await session.commit()
        print("Done. user id:", str(user.id))

    await engine.dispose()


if __name__ == '__main__':
    asyncio.run(main())
