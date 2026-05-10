#!/usr/bin/env python3
"""
scripts/seed_data.py
Seed the Loverace PostgreSQL database with realistic Indian profiles.

Usage:
    python scripts/seed_data.py

Requirements:
    pip install asyncpg bcrypt python-dotenv

The script:
  1. Deletes all existing seed rows (users whose email ends in @seed.loverace.dev)
  2. Creates 10 Indian female profiles + 1 "you" user (gojo profile pic)
  3. Seeds locations around New Delhi (28.6139, 77.2090)
  4. Creates 3 mutual matches + conversations + bond_progress rows
  5. Inserts a few sample messages per conversation
"""

import asyncio
import json
import os
import math
import random
from datetime import datetime, timezone, timedelta

import asyncpg
import bcrypt
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'services', 'core_api', '.env.example'))

DB_URL = os.getenv('ASYNCPG_URL', 'postgresql://loverace:pass@localhost/loverace')

# ── Seed centre: New Delhi ─────────────────────────────────────────────────
CENTRE_LAT = 28.6139
CENTRE_LNG = 77.2090

# ── The "you" user (profile pic served from frontend assets) ──────────────
ME = {
    'email': 'me@seed.loverace.dev',
    'password': 'Demo1234!',
    'display_name': 'You',
    'age': 25,
    'gender': 'woman',
    'orientation': 'straight',
    'bio': 'Exploring Loverace 💕 | Delhi girl | Coffee & chaos',
    'interests': ['music', 'art', 'travel', 'food'],
    'photos': [{'url': '/assests/gojo.jpeg', 'is_primary': True}],
    'height': '164 cm',
    'occupation': 'Product Designer',
    'education': "Bachelor's",
    'lat_offset': 0.0,
    'lng_offset': 0.0,
}

# ── Indian female profiles ────────────────────────────────────────────────
# photos cycle through the real assets in frontend/assests/avatars/
AVATAR_CYCLE = [
    'sakshi-post-04.jpg',
    'sakshi-post-23.jpg',
    'sakshi-post-24.jpg',
    'sakshi-post-25.jpg',
    'sakshi-post-35.jpg',
    'sakshi-post-37.jpg',
]

PROFILES = [
    {
        'email': 'priya.sharma@seed.loverace.dev',
        'display_name': 'Priya Sharma',
        'age': 26,
        'gender': 'woman',
        'orientation': 'straight',
        'bio': 'Coffee lover ☕ | Solo traveler ✈️ | UX nerd',
        'interests': ['travel', 'coffee', 'yoga', 'design'],
        'height': '165 cm',
        'occupation': 'UX Designer',
        'education': 'B.Design',
        'lat_offset': 0.0009,
        'lng_offset': 0.0005,
    },
    {
        'email': 'anika.mehta@seed.loverace.dev',
        'display_name': 'Anika Mehta',
        'age': 24,
        'gender': 'woman',
        'orientation': 'bisexual',
        'bio': 'Software engineer 💻 | Guitar enthusiast 🎸 | Dog mom 🐕',
        'interests': ['music', 'tech', 'hiking', 'dogs'],
        'height': '163 cm',
        'occupation': 'Software Engineer',
        'education': 'B.Tech',
        'lat_offset': 0.0022,
        'lng_offset': 0.0012,
    },
    {
        'email': 'kavya.kapoor@seed.loverace.dev',
        'display_name': 'Kavya Kapoor',
        'age': 23,
        'gender': 'woman',
        'orientation': 'lesbian',
        'bio': 'Artist 🎨 | Plant parent 🌿 | Overthinker with good vibes',
        'interests': ['art', 'plants', 'vegan', 'meditation'],
        'height': '162 cm',
        'occupation': 'Illustrator',
        'education': 'Fine Arts',
        'lat_offset': 0.0041,
        'lng_offset': -0.0022,
    },
    {
        'email': 'sneha.verma@seed.loverace.dev',
        'display_name': 'Sneha Verma',
        'age': 27,
        'gender': 'woman',
        'orientation': 'straight',
        'bio': 'Foodie 🍜 | Fitness freak 💪 | Weekend hiker',
        'interests': ['food', 'fitness', 'hiking', 'cooking'],
        'height': '167 cm',
        'occupation': 'Nutritionist',
        'education': 'M.Sc Nutrition',
        'lat_offset': 0.0082,
        'lng_offset': 0.0035,
    },
    {
        'email': 'pooja.singh@seed.loverace.dev',
        'display_name': 'Pooja Singh',
        'age': 25,
        'gender': 'woman',
        'orientation': 'straight',
        'bio': 'Doctor by day 👩‍⚕️ Dancer by night 💃',
        'interests': ['dance', 'health', 'music', 'travel'],
        'height': '158 cm',
        'occupation': 'Physician',
        'education': 'MBBS',
        'lat_offset': 0.0148,
        'lng_offset': -0.0095,
    },
    {
        'email': 'divya.iyer@seed.loverace.dev',
        'display_name': 'Divya Iyer',
        'age': 28,
        'gender': 'woman',
        'orientation': 'pansexual',
        'bio': 'Storyteller 🎙️ | Movie buff 🎬 | Yoga is my therapy',
        'interests': ['content', 'movies', 'yoga', 'books'],
        'height': '170 cm',
        'occupation': 'Content Creator',
        'education': 'Mass Communication',
        'lat_offset': 0.025,
        'lng_offset': 0.019,
    },
    {
        'email': 'ishita.joshi@seed.loverace.dev',
        'display_name': 'Ishita Joshi',
        'age': 22,
        'gender': 'woman',
        'orientation': 'bisexual',
        'bio': 'Fashion designer ✂️ | Vintage collector | LGBTQ+ advocate 🏳️‍🌈',
        'interests': ['fashion', 'art', 'activism', 'vintage'],
        'height': '169 cm',
        'occupation': 'Fashion Designer',
        'education': 'NIFT',
        'lat_offset': -0.0028,
        'lng_offset': 0.0065,
    },
    {
        'email': 'riya.bose@seed.loverace.dev',
        'display_name': 'Riya Bose',
        'age': 29,
        'gender': 'woman',
        'orientation': 'straight',
        'bio': 'Entrepreneur 🚀 | Traveler | Life is an adventure',
        'interests': ['business', 'travel', 'food', 'adventure'],
        'height': '164 cm',
        'occupation': 'Startup Founder',
        'education': 'MBA',
        'lat_offset': 0.0118,
        'lng_offset': -0.0082,
    },
    {
        'email': 'tanvi.kulkarni@seed.loverace.dev',
        'display_name': 'Tanvi Kulkarni',
        'age': 26,
        'gender': 'woman',
        'orientation': 'straight',
        'bio': 'Architect 🏛️ | Bookworm | Coffee shop hopper ☕',
        'interests': ['architecture', 'books', 'coffee', 'art'],
        'height': '163 cm',
        'occupation': 'Architect',
        'education': 'B.Arch',
        'lat_offset': 0.0178,
        'lng_offset': 0.0122,
    },
    {
        'email': 'meera.pillai@seed.loverace.dev',
        'display_name': 'Meera Pillai',
        'age': 31,
        'gender': 'woman',
        'orientation': 'bisexual',
        'bio': 'Musician 🎵 | Yoga teacher 🧘 | Ocean soul 🌊',
        'interests': ['music', 'yoga', 'ocean', 'meditation'],
        'height': '161 cm',
        'occupation': 'Music Instructor',
        'education': 'B.Music',
        'lat_offset': -0.0052,
        'lng_offset': -0.0043,
    },
]

# Assign avatar photos cyclically
for i, p in enumerate(PROFILES):
    p['photos'] = [{'url': f'/assests/avatars/{AVATAR_CYCLE[i % len(AVATAR_CYCLE)]}', 'is_primary': True}]
    p['password'] = 'Seed1234!'


# ── WKT helper ───────────────────────────────────────────────────────────
def wkt_point(lat, lng):
    return f'SRID=4326;POINT({lng} {lat})'


# ── Main seeder ───────────────────────────────────────────────────────────
async def main():
    print('🌱 Loverace seeder — connecting to', DB_URL)
    pool = await asyncpg.create_pool(DB_URL, min_size=1, max_size=3)

    async with pool.acquire() as conn:
        # ── 1. Clean existing seed rows ────────────────────────────────
        print('🗑️  Removing old seed rows…')
        seed_emails = [ME['email']] + [p['email'] for p in PROFILES]
        old_ids = await conn.fetch(
            "SELECT id FROM users WHERE email = ANY($1::text[])", seed_emails
        )
        old_id_list = [r['id'] for r in old_ids]
        if old_id_list:
            await conn.execute("DELETE FROM users WHERE id = ANY($1::uuid[])", old_id_list)
        print(f'  Removed {len(old_id_list)} old rows')

        # ── 2. Insert "me" user ────────────────────────────────────────
        print('👤 Creating "you" user…')
        me_id = await _insert_user(conn, ME, CENTRE_LAT, CENTRE_LNG)

        # ── 3. Insert profiles ─────────────────────────────────────────
        print('👩 Creating 10 Indian female profiles…')
        profile_ids = []
        for p in PROFILES:
            lat = CENTRE_LAT + p['lat_offset']
            lng = CENTRE_LNG + p['lng_offset']
            uid = await _insert_user(conn, p, lat, lng)
            profile_ids.append(uid)
            print(f'  ✓ {p["display_name"]}')

        # ── 4. Create mutual matches (first 3 profiles) ────────────────
        print('💌 Creating matches…')
        match_data = [
            (profile_ids[0], 'c1', 1, 5, 65),     # Priya – Dating Lv5
            (profile_ids[2], 'c2', 1, 12, 132),    # Kavya – Dating Lv12
            (profile_ids[4], 'c3', 2, 7, 78),      # Pooja – Couples Lv7
        ]
        for (pid, cid_hint, stage, level, xp) in match_data:
            conv_id = await _create_match(conn, me_id, pid, stage, level, xp)
            await _seed_messages(conn, conv_id, me_id, pid)

        print('\n✅ Done! You can now run the app with VITE_DUMMY_DATA=false')

    await pool.close()


async def _insert_user(conn, data, lat, lng):
    """Insert user + profile + location rows. Returns user UUID."""
    pw_hash = bcrypt.hashpw(data['password'].encode(), bcrypt.gensalt()).decode()

    uid = await conn.fetchval(
        """
        INSERT INTO users (email, password_hash, is_active, is_verified)
        VALUES ($1, $2, true, true)
        ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
        RETURNING id
        """,
        data['email'], pw_hash,
    )

    await conn.execute(
        """
        INSERT INTO profiles (
            user_id, display_name, age, gender, orientation,
            bio, interests, photos, height, occupation, education
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        ON CONFLICT (user_id) DO UPDATE SET
            display_name = EXCLUDED.display_name,
            age = EXCLUDED.age,
            gender = EXCLUDED.gender,
            orientation = EXCLUDED.orientation,
            bio = EXCLUDED.bio,
            interests = EXCLUDED.interests,
            photos = EXCLUDED.photos,
            height = EXCLUDED.height,
            occupation = EXCLUDED.occupation,
            education = EXCLUDED.education
        """,
        uid,
        data['display_name'],
        data['age'],
        data['gender'],
        data['orientation'],
        data.get('bio', ''),
        data.get('interests', []),
        json.dumps(data.get('photos', [])),
        data.get('height', ''),
        data.get('occupation', ''),
        data.get('education', ''),
    )

    await conn.execute(
        """
        INSERT INTO locations (user_id, geom, lat, lng)
        VALUES ($1, ST_GeogFromText($2), $3, $4)
        ON CONFLICT (user_id) DO UPDATE SET
            geom = EXCLUDED.geom, lat = EXCLUDED.lat, lng = EXCLUDED.lng,
            updated_at = NOW()
        """,
        uid, wkt_point(lat, lng), lat, lng,
    )

    await conn.execute(
        """
        INSERT INTO user_settings (user_id) VALUES ($1)
        ON CONFLICT DO NOTHING
        """,
        uid,
    )

    return uid


async def _create_match(conn, user_a, user_b, stage, level, xp):
    """Create mutual swipes → match → conversation → bond_progress."""
    for (frm, to) in [(user_a, user_b), (user_b, user_a)]:
        await conn.execute(
            """
            INSERT INTO swipes (from_user_id, to_user_id, direction)
            VALUES ($1, $2, 'right')
            ON CONFLICT DO NOTHING
            """,
            frm, to,
        )

    match_id = await conn.fetchval(
        """
        INSERT INTO matches (user_a_id, user_b_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        RETURNING id
        """,
        user_a, user_b,
    )
    if match_id is None:
        match_id = await conn.fetchval(
            "SELECT id FROM matches WHERE user_a_id=$1 AND user_b_id=$2",
            user_a, user_b,
        )

    conv_id = await conn.fetchval(
        """
        INSERT INTO conversations (match_id)
        VALUES ($1)
        ON CONFLICT DO NOTHING
        RETURNING id
        """,
        match_id,
    )
    if conv_id is None:
        conv_id = await conn.fetchval(
            "SELECT id FROM conversations WHERE match_id=$1", match_id
        )

    for uid in [user_a, user_b]:
        await conn.execute(
            """
            INSERT INTO bond_progress
                (conversation_id, user_id, stage, stage_xp, level)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (conversation_id, user_id) DO UPDATE SET
                stage=$3, stage_xp=$4, level=$5
            """,
            conv_id, uid, stage, xp, level,
        )

    return conv_id


SAMPLE_MSG_PAIRS = [
    [
        ('Hey! Nice to match with you 😊', 1),
        ('Hi! Love your profile!', 0),
        ('What are your hobbies?', 1),
        ('I love design and traveling 🌍', 0),
    ],
    [
        ('Hey, your profile looks so interesting!', 1),
        ('Thanks! I love art too 🎨', 0),
        ('We should check out that new gallery in Connaught Place', 1),
        ('Absolutely! When are you free?', 0),
    ],
    [
        ('Hi! I saw you like dancing too!', 1),
        ('Yes! Salsa is my favorite. Do you dance?', 0),
        ('Kuchipudi actually 💃 We should go to a show!', 1),
        ('That sounds amazing!', 0),
    ],
]


async def _seed_messages(conn, conv_id, me_id, partner_id, pair_index=None):
    idx = pair_index if pair_index is not None else random.randint(0, len(SAMPLE_MSG_PAIRS) - 1)
    pairs = SAMPLE_MSG_PAIRS[idx % len(SAMPLE_MSG_PAIRS)]
    base_time = datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 48))
    for i, (text, who) in enumerate(pairs):
        sender = partner_id if who == 1 else me_id
        await conn.execute(
            """
            INSERT INTO messages (conversation_id, sender_id, text, created_at)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT DO NOTHING
            """,
            conv_id, sender, text,
            base_time + timedelta(minutes=i * 12),
        )
    # Update conversation last_message
    await conn.execute(
        "UPDATE conversations SET updated_at=NOW() WHERE id=$1", conv_id
    )


if __name__ == '__main__':
    asyncio.run(main())
