#!/usr/bin/env python3
"""
Directly create minimal SQLite tables and insert/update the test user.

This avoids SQLAlchemy metadata.create_all which can fail on Postgres-only
types (ARRAY/JSONB) when running against SQLite in dev.

Run from services/core_api:
  python scripts/insert_vijendra_sqlite_direct.py
"""
import os
import sqlite3
import uuid
from datetime import datetime

from passlib.context import CryptContext

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'dev.db')
EMAIL = 'vijendra.singh@seed.loverace.dev'
PASSWORD = 'love123'
DISPLAY_NAME = 'Vijendra Singh'

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


def ensure_tables(conn: sqlite3.Connection):
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            phone_hash TEXT UNIQUE,
            password_hash TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'active',
            is_verified INTEGER NOT NULL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_active DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    cur.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email ON users (email)")

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS user_settings (
            user_id TEXT PRIMARY KEY,
            sound_enabled INTEGER DEFAULT 1,
            vibrate_enabled INTEGER DEFAULT 1,
            reduce_motion INTEGER DEFAULT 0,
            show_online_status INTEGER DEFAULT 1,
            notifications_enabled INTEGER DEFAULT 1,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    conn.commit()


def upsert_user(conn: sqlite3.Connection):
    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE email = ?", (EMAIL,))
    row = cur.fetchone()
    now = datetime.utcnow().isoformat()
    pw_hash = _pwd.hash(PASSWORD)

    if row:
        uid = row[0]
        cur.execute(
            "UPDATE users SET password_hash = ?, is_verified = 1, status = 'active', last_active = ? WHERE id = ?",
            (pw_hash, now, uid),
        )
        print("Updated existing user:", EMAIL)
    else:
        uid = str(uuid.uuid4())
        cur.execute(
            "INSERT INTO users (id, email, password_hash, is_verified, status, created_at, last_active) VALUES (?, ?, ?, 1, 'active', ?, ?)",
            (uid, EMAIL, pw_hash, now, now),
        )
        print("Inserted new user:", EMAIL)

    # Ensure user_settings exists
    cur.execute("INSERT OR IGNORE INTO user_settings (user_id) VALUES (?)", (uid,))
    conn.commit()
    print("User id:", uid)


def main():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    try:
        ensure_tables(conn)
        upsert_user(conn)
    finally:
        conn.close()


if __name__ == '__main__':
    main()
