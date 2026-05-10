#!/usr/bin/env python3
"""
Create a simple SQLite-compatible `profiles` row for the seeded test user.
Run from services/core_api:
  python scripts/insert_vijendra_profile_sqlite.py
"""
import os
import sqlite3
import json

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'dev.db')
EMAIL = 'vijendra.singh@seed.loverace.dev'

PROFILE = {
    "display_name": "Vijendra Singh",
    "date_of_birth": "1992-06-15",
    "gender_identity": "man",
    "pronouns": "he/him",
    "sexual_orientation": ["straight"],
    "looking_for": ["dating"],
    "bio": "Test user for local development.",
    "photos": [{"url": "/assests/avatars/1.png"}],
    "interests": ["hiking", "coffee", "movies"],
    "height_cm": 175,
    "education": "College",
    "job_title": "Engineer",
    "languages": ["English"],
    "smoking": "no",
    "drinking": "social",
}


def ensure_profiles_table(conn: sqlite3.Connection):
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS profiles (
            user_id TEXT PRIMARY KEY,
            display_name TEXT NOT NULL,
            date_of_birth TEXT,
            gender_identity TEXT,
            pronouns TEXT,
            sexual_orientation TEXT,
            looking_for TEXT,
            bio TEXT,
            photos TEXT,
            interests TEXT,
            height_cm INTEGER,
            education TEXT,
            job_title TEXT,
            languages TEXT,
            smoking TEXT,
            drinking TEXT,
            privacy_settings TEXT,
            preferences TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    conn.commit()


def upsert_profile(conn: sqlite3.Connection, user_id: str):
    cur = conn.cursor()
    cur.execute("SELECT user_id FROM profiles WHERE user_id = ?", (user_id,))
    exists = cur.fetchone()

    data = PROFILE.copy()
    # store list/dict fields as JSON text
    for k in ("sexual_orientation", "looking_for", "photos", "interests", "languages", "privacy_settings", "preferences"):
        v = data.get(k)
        if v is None:
            data[k] = None
        else:
            data[k] = json.dumps(v)

    if exists:
        cur.execute(
            """
            UPDATE profiles SET display_name=?, date_of_birth=?, gender_identity=?, pronouns=?, sexual_orientation=?, looking_for=?, bio=?, photos=?, interests=?, height_cm=?, education=?, job_title=?, languages=?, smoking=?, drinking=? WHERE user_id=?
            """,
            (
                data["display_name"],
                data["date_of_birth"],
                data["gender_identity"],
                data["pronouns"],
                data["sexual_orientation"],
                data["looking_for"],
                data["bio"],
                data["photos"],
                data["interests"],
                data["height_cm"],
                data["education"],
                data["job_title"],
                data["languages"],
                data["smoking"],
                data["drinking"],
                user_id,
            ),
        )
        print("Updated profile for user:", user_id)
    else:
        cur.execute(
            """
            INSERT INTO profiles (user_id, display_name, date_of_birth, gender_identity, pronouns, sexual_orientation, looking_for, bio, photos, interests, height_cm, education, job_title, languages, smoking, drinking)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                data["display_name"],
                data["date_of_birth"],
                data["gender_identity"],
                data["pronouns"],
                data["sexual_orientation"],
                data["looking_for"],
                data["bio"],
                data["photos"],
                data["interests"],
                data["height_cm"],
                data["education"],
                data["job_title"],
                data["languages"],
                data["smoking"],
                data["drinking"],
            ),
        )
        print("Inserted profile for user:", user_id)

    conn.commit()


def main():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    try:
        ensure_profiles_table(conn)
        cur = conn.cursor()
        cur.execute("SELECT id FROM users WHERE email = ?", (EMAIL,))
        row = cur.fetchone()
        if not row:
            print("User not found in users table. Run insert_vijendra_sqlite_direct.py first.")
            return
        user_id = row[0]
        upsert_profile(conn, user_id)
    finally:
        conn.close()


if __name__ == '__main__':
    main()
