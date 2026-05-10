# 💗 Loverace

> *First of its kind — proximity-first, LGBTQIA-friendly dating, powered by a live radar and gamified love journeys.*

![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react)
![Python](https://img.shields.io/badge/Backend-Python%20%2B%20FastAPI-3776AB?logo=python)
![PostgreSQL](https://img.shields.io/badge/DB-PostgreSQL%20%2B%20PostGIS-4169E1?logo=postgresql)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-In%20Development-orange)

---

## Table of Contents

1. [About](#about)
2. [Features](#features)
3. [UI / UX Design](#ui--ux-design)
4. [Architecture](#architecture)
5. [Microservices](#microservices)
6. [Tech Stack](#tech-stack)
7. [Repository Layout](#repository-layout)
8. [Assets](#assets)
9. [Dummy Data Mode](#dummy-data-mode)
10. [Bond Progression System](#bond-progression-system)
11. [Quickstart](#quickstart)
12. [Environment Variables](#environment-variables)
13. [API Overview](#api-overview)
14. [Privacy & Safety](#privacy--safety)
15. [Contributing](#contributing)
16. [License](#license)

---

## About

**Loverace** is a first-of-its-kind dating platform that finds real connections near you — in real time. Instead of endless blind scrolling, you open the **Radar**: an OpenStreetMap with a circular radar overlay centred on your location. As the radar sweeps, bubble-circles pop up around the centre — each bubble shows the person's face photo and their distance from you (e.g. "320m away"). Tap a bubble to view their profile, or switch to the classic **Swipe Feed** if you prefer.

When you swipe right on someone (interested 💋), a shower of kisses and love-heart emojis dangle across the screen and cascade down like confetti, accompanied by a kiss sound. Swipe left (not interested 💩), and the same spectacular effect plays out with yuck and poop emojis tumbling down with a fart sound.

When two people **both** swipe right on each other — even if neither knew the other had already liked them — they **automatically become Friends** and a chat opens between them. From that moment, every unique word they type in conversation earns them **Bond XP**, advancing their relationship level from **Level 1 → Level 101** (Dating stage), and then onward through **Couples → Soulmate → Lovers** — each stage requiring another 101 levels. After every 101 levels, both users must confirm before the bond stage is upgraded.

Loverace is explicitly **LGBTQIA+ friendly**: straight, bi, gay, pan, ace, and any custom orientation are all supported with full inclusivity in matching logic.

---

## Features

### Core
| # | Feature | Description |
|---|---------|-------------|
| 1 | **Proximity Radar** | Live **OpenStreetMap** with a circular radar overlay centred on your position. A rotating sweep beam animates continuously. As it sweeps, **bubble-circles pop up** around the radar centre — each bubble displays the person's **face photo** and their **distance from the centre** (e.g. "320m away"). Radius adjustable: **100m to 5km**. Default distances are fuzzy/rounded for privacy. |
| 2 | **Swipe Feed** | Tinder-style card stack as an alternative to the radar. Swipe right = interested, left = pass. |
| 3 | **Rich Profiles** | 14+ fields: name, DOB, gender identity, pronouns, sexual orientation, looking-for, bio, photos, interests, height, education, job, languages, smoking, drinking. Per-field visibility controls. |
| 4 | **Inclusive Matching** | Straight, gay, bi, pan, ace, and any custom orientation; all gender identities; matching engine respects all preference combos. |
| 5 | **Swipe Reactions** | **Right-swipe** (interested) → multiple 💋 kisses and 💕 love emojis **dangle** across the screen then cascade down like confetti, with a kiss sound. **Left-swipe** (pass) → 🤢 yuck and 💩 poop emojis **dangle** and cascade in the same dramatic confetti effect, with a fart sound. Both effects respect mute and reduced-motion settings. |
| 6 | **Who Liked You** | See a list/grid of everyone who has swiped right on you. If you **both** swiped right — even **unknowingly**, without knowing the other person had already liked you — the app **automatically makes you Friends** and instantly opens a chat. No action needed from either side; the match just appears. |
| 7 | **Chat** | Real-time chat for matched (friend) users. Features typing indicators, read receipts, emoji picker, and media sharing. Every message you send can earn you **Bond XP** — advancing your relationship from **Level 1 to Level 101** within your current bond stage. |
| 8 | **Bond Progression** | Four bond stages — **Dating → Couples → Soulmate → Lovers** — each with **Level 1 through Level 101**. You advance levels by earning XP through chat (see feature #9). The number of unique words needed to reach the next level **increases progressively** as you level up (early levels are easy; higher levels demand richer vocabulary). After completing all 101 levels in a stage, **both users must confirm** to upgrade to the next bond stage. |
| 9 | **Unique-Word XP** | Only **new unique words** you have never used before in that conversation count as XP. Only **one message per user per conversation every 10 seconds** is counted (the rest are delivered but score 0 XP). As your level rises, **more unique words are required** to reach the next level — encouraging richer, more varied conversations. Anti-cheat (per-message caps, daily limits, heuristics) enforced server-side. |
| 10 | **Verified Profiles** | Optional photo/ID verification badge to reduce catfishing. |
| 11 | **Icebreaker Prompts** | Curated prompts on profiles and in chat to reduce first-message friction. |
| 12 | **Video Intros** | 15–30s short video snippet on profiles. |
| 13 | **In-App Video Calls** | WebRTC video calling between matched users. |
| 14 | **Events & Meetups** | Local group events and RSVP feature. |
| 15 | **Moments / Stories** | Ephemeral story posts visible to nearby users or matches. |
| 16 | **Compatibility Quizzes** | Short quizzes whose results adjust match ranking weights. |
| 17 | **Safety Center** | Block/report, call relay, emergency ETA share, location blur. |
| 18 | **Premium Boosts** | Boosts, super-likes, unlock full "who liked me" list. |
| 19 | **Gifts** | Animated virtual gifts and micro-transactions. |
| 20 | **Profile Streaks** | Daily login / chat streaks that reward consistent engagement. |

---

## UI / UX Design

### Visual Theme
- **Colors**: Rich **crimson red** (`#C0002A`) as the primary accent, warm **pure white** (`#FFFFFF`) as the base, soft rose blush (`#FFE4EC`) for backgrounds. All key CTAs and highlights are red on white.
- **Typography**: Rounded, friendly fonts (Poppins / Nunito) to feel warm and modern.
- **Iconography**: Heart-forward; all icons and illustrations use the red-white palette.

### Floating Hearts Ambient Layer
A persistent canvas layer floating behind all screens displays slowly drifting ❤️ hearts of varying sizes, opacity, and speed — giving the app a warm, romantic atmosphere at all times. Hearts respond to mouse/touch parallax. Intensity can be configured or muted.

### High-Graphics Interactive Elements
| Element | Behaviour |
|---------|-----------|
| Radar sweep | Animated rotating beam (canvas WebGL) over the live map; as the beam sweeps, **bubble-circles pop up** around the radar centre, each containing the person's face and distance label, with a heartbeat pulse ring |
| Swipe cards | 3D-tilt physics on hover/drag; velocity-sensitive throw animation |
| Right-swipe reaction | Confetti burst of 💋 💕 ✨ kisses + rose petals + kiss SFX |
| Left-swipe reaction | 💩 🤢 cascade + wobbly "nope" text + fart SFX |
| Mutual match | Full-screen confetti explosion + heart shower with dramatic match-reveal animation |
| Bond level-up | Animated level badge pulse + fireworks + celebratory chime |
| Stage upgrade (Dating→Couples etc.) | Full-screen cinematic reveal with glowing heart ring animation and confirmation overlay |
| Floating hearts | Ambient canvas layer present across all pages |
| Profile photos | Parallax depth card stack with soft shadow |

### Accessibility
- All animations respect `prefers-reduced-motion` and a global in-app toggle.
- All sounds respect system mute and a global in-app mute toggle.
- Full keyboard navigation and screen-reader labels on all interactive elements.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser / PWA                             │
│         React + Vite  (red/white UI, floating hearts)        │
└──────────────────┬───────────────────┬──────────────────────┘
                   │ HTTPS REST        │ WebSocket (wss://)
                   ▼                   ▼
┌──────────────────────┐   ┌────────────────────────────────┐
│  Microservice A       │   │  Microservice B                │
│  core_api (port 8000) │   │  realtime_gateway (port 8001)  │
│  FastAPI / REST       │   │  FastAPI / WebSocket           │
│  Stateless            │   │  Stateful (presence, chat)     │
└──────────┬───────────┘   └───────────────┬────────────────┘
           │ pg_notify / pg_listen         │
           └───────────────┬───────────────┘
                           ▼
              ┌──────────────────────────────────┐
              │  PostgreSQL 15 + PostGIS 3.3      │
              │  • profiles, swipes, matches      │
              │  • bond_vocab  (XP word sets)     │
              │  • bond_rate_limit  (10s lock)    │
              │  • bond_progress  (level / stage) │
              │  • LISTEN / NOTIFY channels       │
              │  • GiST geo indexes  (radar)      │
              └──────────────────────────────────┘
                           │
              ┌────────────▼───────────┐
              │  S3-compatible store    │
              │  (photos, video, audio) │
              └────────────────────────┘
```

### How the services communicate
- **core_api** owns all REST operations. After an event worth broadcasting (e.g., a match is created, a swipe is recorded), it issues a `pg_notify('loverace_events', payload)` call on its existing PostgreSQL connection.
- **realtime_gateway** holds a persistent `LISTEN loverace_events` connection to PostgreSQL (via `asyncpg`) and receives those notifications, then pushes them to the relevant WebSocket clients.
- No external message broker is needed — **PostgreSQL LISTEN/NOTIFY** is the only inter-service communication channel. Both services connect to the same database but own separate tables.

---

## Microservices

### Why two services split by *protocol*, not by *domain*

The previous split (Auth/Profile vs Chat) created coupling problems: match creation lives in the profile domain but must immediately trigger a realtime notification. Splitting by **HTTP (stateless) vs WebSocket (stateful)** solves this cleanly.

---

### Microservice A — `core_api` (REST · port 8000)

Handles every **stateless, request-response operation**. Easy to scale horizontally behind a load balancer.

| Domain | Responsibilities |
|--------|-----------------|
| **Auth** | Register, login, JWT issue/refresh, phone/email verification, OAuth providers |
| **Profiles** | CRUD for 14+ profile fields, photo upload/moderation, privacy settings |
| **Location** | Ingest GPS coordinates, write to PostGIS (geography column with GiST index), handle visibility prefs |
| **Radar** | Query nearby users via PostGIS `ST_DWithin` on indexed geography column, return fuzzy distance buckets |
| **Feed** | Generate ranked swipe-card deck (exclusion filters, preference matching) |
| **Swipes** | Record swipe events; atomically detect mutual swipe in a DB transaction; create match record; issue `pg_notify('loverace_events', ...)` so realtime_gateway can push the match notification |
| **Matches** | List matches, unmatch, block, report |
| **Who Liked Me** | Return list of users who swiped right on current user (gated / premium) |
| **Settings** | User preferences (sound, motion, notifications, privacy) |
| **Media** | Signed upload URLs, moderation status, video intro ingestion |

Tech: `FastAPI`, `SQLAlchemy` (async), `Alembic` (migrations), `Pydantic v2`, `python-jose` (JWT), `asyncpg` (raw async Postgres for NOTIFY + geospatial queries), `APScheduler` (background jobs for moderation, notifications)

---

### Microservice B — `realtime_gateway` (WebSocket · port 8001)

Handles every **stateful, long-lived connection**. Uses sticky sessions (or a shared `ws_connections` table in PostgreSQL for multi-instance routing) to route messages.

| Domain | Responsibilities |
|--------|-----------------|
| **Chat** | Relay messages between matched users in real time; persist to Postgres |
| **Typing indicators** | Broadcast `user.typing` events within a conversation |
| **Presence** | Track online/offline status; push `user.online` / `user.offline` events |
| **Radar live updates** | Push `radar.appear` / `radar.leave` events to subscribed clients |
| **Bond XP** | On each incoming message: run Python XP engine (10s lock via `bond_rate_limit` table row-lock + unique-word insert into `bond_vocab`); recalculate level; push `bond.progress` event |
| **Stage confirmation** | Handle both-user confirm flow; reset stage XP; push `bond.stage_upgraded` event |
| **Notifications** | Push match notifications, new-like alerts, bond level-ups to connected clients |
| **PG NOTIFY listener** | Holds a persistent `LISTEN loverace_events` asyncpg connection; routes events published by `core_api` to the correct WebSocket clients |

Tech: `FastAPI` (WebSocket support), `asyncpg` (LISTEN/NOTIFY + bond engine queries), async `SQLAlchemy` (ORM), `websockets`

---

## Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Frontend | React 18 + Vite 5 | Web PWA; TypeScript optional |
| UI library | Custom (red/white theme) + Tailwind CSS | No heavy component lib to keep full design control |
| Maps | MapLibre GL JS + OpenStreetMap tiles | WebGL-accelerated; no API key needed |
| Animations | Lottie Web + Framer Motion | Lottie for complex effects, Framer for transitions |
| Confetti / effects | `canvas-confetti` + custom canvas hearts layer | |
| Audio | Howler.js | Kiss sound, fart sound, match chime, level-up chime |
| Swipe UI | `react-spring` + `@use-gesture` | Physics-based drag + throw |
| Backend A | Python 3.12 + FastAPI + SQLAlchemy (async) | REST, runs on uvicorn/gunicorn |
| Backend B | Python 3.12 + FastAPI (WebSocket) + asyncpg | Async WS gateway + PG NOTIFY listener |
| Database | PostgreSQL 15 + PostGIS 3.3 | Single source of truth: geo, XP, rate-limits, events |
| Inter-service events | PostgreSQL LISTEN / NOTIFY | Built-in; no extra broker needed |
| Object storage | S3 / MinIO | Photos, video intros, audio assets |
| Dev environment | Docker Compose | One command to start all services |

---

## Repository Layout

```
Loverace/
├── README.md
├── frontend/                      # React + Vite web app
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx               # Entry point
│       ├── App.jsx                # Router + floating hearts canvas
│       ├── theme/                 # Red/white design tokens, global CSS
│       ├── assets/                # ← Place your images & sounds here
│       │   ├── images/            # Provided by project owner
│       │   ├── sounds/            # kiss.mp3, fart.mp3, match.mp3, levelup.mp3
│       │   └── lottie/            # Lottie JSON animation files
│       ├── components/
│       │   ├── radar/             # Radar map + overlay + avatar pulses
│       │   ├── swipe/             # Card stack + swipe reactions
│       │   ├── chat/              # Chat UI + bond progress bar
│       │   ├── profile/           # Profile form + viewer
│       │   ├── hearts/            # Ambient floating hearts canvas
│       │   └── common/            # Buttons, inputs, modals, badges
│       ├── pages/                 # Route-level pages
│       ├── hooks/                 # Custom React hooks (useWebSocket, useRadar, …)
│       ├── store/                 # State management (Zustand / Context)
│       └── services/              # API clients (REST + WebSocket)
│
├── services/
│   ├── core_api/                  # Microservice A — REST (port 8000)
│   │   ├── requirements.txt
│   │   ├── pyproject.toml
│   │   ├── alembic/               # DB migrations
│   │   └── src/
│   │       ├── main.py
│   │       ├── routers/           # auth, profiles, radar, swipes, matches, media
│   │       ├── models/            # SQLAlchemy ORM models
│   │       ├── schemas/           # Pydantic request/response schemas
│   │       ├── services/          # Business logic
│   │       └── config.py
│   │
│   └── realtime_gateway/          # Microservice B — WebSocket (port 8001)
│       ├── requirements.txt
│       ├── pyproject.toml
│       └── src/
│           ├── main.py
│           ├── ws/                # WebSocket connection manager
│           ├── handlers/          # chat, presence, bond, radar_push
│           ├── bond/              # Python XP engine (unique-word counting, leveling)
│           ├── models/            # Shared ORM models (read-only from this service)
│           └── config.py
│
├── sql/
│   ├── 001_init.sql               # Users, profiles, locations, swipes, matches
│   ├── 002_conversations.sql      # Messages, bond_progress, bond_confirmations
│   └── 003_postgis_indexes.sql    # GiST indexes and PostGIS helpers
│
├── infra/
│   ├── docker-compose.yml         # All services + Postgres + MinIO
│   └── nginx.conf                 # Reverse proxy (frontend + API routing)
│
└── scripts/
    ├── seed_dummy_data.py         # Populate DB with realistic dummy profiles
    └── reset_db.sh                # Drop + recreate dev DB
```

---

## Assets

All image and audio assets are **provided by the project owner** and should be placed in:

```
frontend/src/assets/
├── images/           # Profile photos, illustrations, icons, backgrounds
├── sounds/
│   ├── kiss.mp3      # Plays on right-swipe
│   ├── fart.mp3      # Plays on left-swipe
│   ├── match.mp3     # Plays when mutual match occurs
│   └── levelup.mp3   # Plays on bond level-up
└── lottie/
    ├── confetti.json  # Right-swipe confetti / kiss burst
    ├── poop_rain.json # Left-swipe yuck cascade
    ├── match.json     # Match reveal animation
    └── levelup.json   # Level-up celebration
```

> **Note**: Sounds and Lottie files are referenced by the frontend via named imports. Drop replacement files in and the app will pick them up automatically.

---

## Dummy Data Mode

For local development without real users, set `VITE_DUMMY_DATA=true` in `frontend/.env.local`. This activates **Dummy Data Mode** which:

- Seeds the radar with ~20 fake nearby profiles (random names, ages, orientations, distances).
- Populates the swipe feed with generated cards (including photos from `assets/images/dummy/`).
- Simulates incoming chat messages and bond XP events on a timer so all animations and progression flows can be tested without a live backend.
- Marks the UI with a subtle **"Demo Mode"** ribbon so it is never confused with production.

Backend dummy data can be seeded into Postgres locally using:

```bash
cd scripts
python seed_dummy_data.py
```

---

## Bond Progression System

Each matched pair shares a single **Bond Journey** tracked by chat activity.

### Stages

```
Dating  (Level 1 → 101)  →  Couples  (Level 1 → 101)  →  Soulmate  (Level 1 → 101)  →  Lovers  (Level 1 → 101)
```

After completing all 101 levels in any stage, **both users must actively confirm** the upgrade before the bond advances. If either user doesn't confirm, the pair stays at Level 101 of their current stage until both agree.

### XP Rules

- **XP = new unique words**: every word in your message that you have never used before in that same conversation adds 1 XP.
- **10-second rate limit**: only **one message per user per conversation** scores XP every 10 seconds. Subsequent messages in the same 10s window are delivered normally but score 0 XP. This encourages meaningful, considered messages rather than spam.
- **In a counted message, only unique words count**: repeated words within the same message do not score double.
- **Scaling word requirement**: the number of new unique words needed to level up **increases progressively as your level rises** within a stage — and is even higher in later stages. Early levels (1–20) need very few words; higher levels (80–101) require significantly more. This rewards long-term, vocabulary-rich conversations.
- Words are normalized before counting: lowercased, punctuation stripped, URLs removed, stopwords excluded.
- Per-message cap: max **30 new words** counted per message (anti-cheat).

### Level math

The **words needed** to advance from Level $L$ to Level $L+1$ within Stage $S$ (both 1-indexed):

$$\text{words\_needed}(L,\, S) = 10 + (L - 1) \times 2 + (S - 1) \times 50$$

The **cumulative words** required to reach Level $L$ from the start of Stage $S$:

$$\text{cumulative\_xp}(L,\, S) = (L - 1) \times \bigl[8 + (S-1) \times 50 + L\bigr]$$

### Full leveling table

| Stage | Level → Next | Words needed | Cumulative (since stage start) |
|-------|-------------|--------------|-------------------------------|
| **Dating** (S=1) | 1 → 2 | 10 | 0 |
| Dating | 10 → 11 | 28 | 90 |
| Dating | 25 → 26 | 58 | 600 |
| Dating | 50 → 51 | 108 | 2,450 |
| Dating | 75 → 76 | 158 | 5,550 |
| Dating | 100 → 101 | 208 | 9,900 |
| 🔒 **Complete Dating** | — | — | **11,110 total words** |
| **Couples** (S=2) | 1 → 2 | 60 | 0 |
| Couples | 25 → 26 | 108 | 2,050 |
| Couples | 50 → 51 | 158 | 4,950 |
| Couples | 100 → 101 | 258 | 14,950 |
| 🔒 **Complete Couples** | — | — | **16,160 total words** |
| **Soulmate** (S=3) | 1 → 2 | 110 | 0 |
| Soulmate | 25 → 26 | 158 | 3,050 |
| Soulmate | 50 → 51 | 208 | 7,450 |
| Soulmate | 100 → 101 | 308 | 20,050 |
| 🔒 **Complete Soulmate** | — | — | **21,210 total words** |
| **Lovers** (S=4) | 1 → 2 | 160 | 0 |
| Lovers | 25 → 26 | 208 | 4,050 |
| Lovers | 50 → 51 | 258 | 9,950 |
| Lovers | 100 → 101 | 358 | 25,150 |
| 🔒 **Complete Lovers** | — | — | **26,260 total words** |
| 🏆 **Grand total (all stages)** | | | **≈ 74,740 unique words** |

> Early levels in Dating are designed to be achievable in a few days of chatting. Reaching Lovers Level 101 takes genuine long-term vocabulary-rich conversation.

### Stage confirmation flow

When a user's level reaches **101** within any stage:
1. Server sets `pending_confirmation = true` in `bond_progress`.
2. Both users see a **"Upgrade Bond?"** overlay in the UI with a cinematic animation.
3. Each user sends a `bond.confirm` WebSocket event.
4. Once **both confirm**, the server:
   - Resets `stage_xp = 0` and `level = 1` for both users.
   - Increments `stage` (1→2→3→4): Dating → Couples → Soulmate → Lovers.
   - Notifies both clients with `bond.stage_upgraded`, triggering the full-screen reveal.
5. If either user declines or ignores, the bond stays locked at Level 101 until both agree.

### Implementation (server-side Python, Microservice B — no Redis)

All rate-limiting and vocabulary state is stored in PostgreSQL. The 10-second lock uses an `ON CONFLICT DO UPDATE ... WHERE last_counted_at < NOW() - INTERVAL '10 seconds'` pattern — if the row was updated too recently, the `RETURNING` clause returns nothing, signalling the rate limit.

```python
# services/realtime_gateway/src/bond/xp_engine.py
import re
from datetime import timezone
from typing import Any
import asyncpg

STOPWORDS = {
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to",
    "for", "of", "with", "by", "is", "was", "are", "be", "been",
    "i", "you", "he", "she", "it", "we", "they", "my", "your",
}
XP_LOCK_SECONDS  = 10
XP_CAP_PER_MSG   = 30
STAGE_NAMES      = ["Dating", "Couples", "Soulmate", "Lovers"]
LEVELS_PER_STAGE = 101


def words_needed(level: int, stage: int) -> int:
    """Words needed to advance from `level` to `level + 1` (both 1-indexed)."""
    return 10 + (level - 1) * 2 + (stage - 1) * 50


def normalize_tokens(text: str) -> set[str]:
    text = text.lower()
    text = re.sub(r"https?://\S+", "", text)
    text = re.sub(r"[^\w\s]", "", text)
    return {t for t in text.split() if len(t) >= 2 and t not in STOPWORDS}


def xp_to_level(stage_xp: int, stage: int) -> int:
    """Derive current level (1-indexed) from accumulated stage XP."""
    level, cumulative = 1, 0
    while level < LEVELS_PER_STAGE:
        needed = words_needed(level, stage)
        if cumulative + needed > stage_xp:
            break
        cumulative += needed
        level += 1
    return level


async def process_message_xp(
    conn: asyncpg.Connection,
    conversation_id: str,
    sender_id: str,
    message_text: str,
) -> dict[str, Any]:
    """
    Award XP for a chat message and return the updated progression state.
    Returns:
        xp_awarded          – new words counted this message (0 if rate-limited)
        rate_limited        – True if blocked by 10s rule
        level               – current level within stage (1–101)
        stage               – current stage number (1–4)
        stage_name          – e.g. "Dating"
        words_to_next_level – words needed to reach next level
        pending_confirmation – True when level == 101 and awaiting both confirms
    """
    tokens = normalize_tokens(message_text)
    if not tokens:
        return {"xp_awarded": 0, "rate_limited": False,
                **await _current_progress(conn, conversation_id, sender_id)}

    async with conn.transaction():
        # ── 1. Enforce 10-second rate limit ───────────────────────────────────
        # The WHERE clause prevents the update (and RETURNING) if last_counted_at
        # is still within the lockout window — no row returned = rate limited.
        lock_row = await conn.fetchrow(
            """
            INSERT INTO bond_rate_limit (conversation_id, user_id, last_counted_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (conversation_id, user_id) DO UPDATE
              SET last_counted_at = NOW()
              WHERE bond_rate_limit.last_counted_at
                    < NOW() - ($3 * INTERVAL '1 second')
            RETURNING last_counted_at
            """,
            conversation_id, sender_id, XP_LOCK_SECONDS,
        )
        if lock_row is None:
            return {"xp_awarded": 0, "rate_limited": True,
                    **await _current_progress(conn, conversation_id, sender_id)}

        # ── 2. Find new tokens not yet seen in this conversation ───────────────
        existing  = await conn.fetch(
            "SELECT word FROM bond_vocab WHERE conversation_id=$1 AND user_id=$2",
            conversation_id, sender_id,
        )
        seen       = {r["word"] for r in existing}
        new_tokens = list(tokens - seen)[:XP_CAP_PER_MSG]
        xp_awarded = len(new_tokens)

        if xp_awarded == 0:
            return {"xp_awarded": 0, "rate_limited": False,
                    **await _current_progress(conn, conversation_id, sender_id)}

        # ── 3. Persist new vocabulary ──────────────────────────────────────────
        await conn.executemany(
            """
            INSERT INTO bond_vocab (conversation_id, user_id, word)
            VALUES ($1, $2, $3) ON CONFLICT DO NOTHING
            """,
            [(conversation_id, sender_id, w) for w in new_tokens],
        )

        # ── 4. Accumulate XP, derive level ────────────────────────────────────
        progress = await conn.fetchrow(
            """
            UPDATE bond_progress
            SET stage_xp = stage_xp + $3
            WHERE conversation_id=$1 AND user_id=$2
            RETURNING stage, stage_xp, pending_confirmation
            """,
            conversation_id, sender_id, xp_awarded,
        )
        stage    = progress["stage"]      # 1–4
        stage_xp = progress["stage_xp"]
        level    = xp_to_level(stage_xp, stage)
        pending  = level >= LEVELS_PER_STAGE

        await conn.execute(
            """
            UPDATE bond_progress
            SET level = $3, pending_confirmation = $4
            WHERE conversation_id=$1 AND user_id=$2
            """,
            conversation_id, sender_id, min(level, LEVELS_PER_STAGE), pending,
        )

        # ── 5. Notify realtime_gateway via PostgreSQL LISTEN/NOTIFY ───────────
        import json
        payload = json.dumps({
            "conversation_id": conversation_id,
            "user_id":         sender_id,
            "xp":              xp_awarded,
            "level":           min(level, LEVELS_PER_STAGE),
            "stage":           stage,
            "stage_name":      STAGE_NAMES[stage - 1],
            "pending":         pending,
        })
        await conn.execute("SELECT pg_notify('bond_updates', $1)", payload)

    return {
        "xp_awarded":           xp_awarded,
        "rate_limited":         False,
        "level":                min(level, LEVELS_PER_STAGE),
        "stage":                stage,
        "stage_name":           STAGE_NAMES[stage - 1],
        "words_to_next_level":  words_needed(min(level, LEVELS_PER_STAGE), stage),
        "pending_confirmation": pending,
    }


async def _current_progress(conn, conversation_id, sender_id):
    row = await conn.fetchrow(
        "SELECT stage, stage_xp, level, pending_confirmation FROM bond_progress "
        "WHERE conversation_id=$1 AND user_id=$2",
        conversation_id, sender_id,
    )
    if not row:
        return {"level": 1, "stage": 1, "stage_name": "Dating",
                "words_to_next_level": 10, "pending_confirmation": False}
    return {
        "level":                row["level"],
        "stage":                row["stage"],
        "stage_name":           STAGE_NAMES[row["stage"] - 1],
        "words_to_next_level":  words_needed(row["level"], row["stage"]),
        "pending_confirmation": row["pending_confirmation"],
    }
```

---

## Quickstart

### Prerequisites
- Docker & Docker Compose
- Node.js ≥ 20
- Python ≥ 3.12

### 1 — Start all services with Docker Compose

```bash
cd infra
docker compose up --build
```

This starts: Postgres + PostGIS, MinIO (S3), core_api, realtime_gateway, and the Vite dev server at http://localhost:5173.

### 2 — Frontend only (without Docker)

```bash
cd frontend
npm install
cp .env.example .env.local   # set VITE_API_URL and VITE_WS_URL
npm run dev
```

### 3 — Python microservices only (without Docker)

```bash
# Terminal 1 — Microservice A
cd services/core_api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8000

# Terminal 2 — Microservice B
cd services/realtime_gateway
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8001
```

### 4 — Seed dummy data

```bash
cd scripts
python seed_dummy_data.py
```

---

## Environment Variables

Create a `.env` (or `infra/.env`) file based on the following:

### Shared

| Variable | Example | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql+asyncpg://loverace:pass@localhost/loverace` | Async Postgres connection |
| `JWT_SECRET` | `changeme_use_32+_chars` | JWT signing secret |
| `JWT_EXPIRY_MINUTES` | `60` | Access token TTL |

### Microservice A (`core_api`)

| Variable | Example | Description |
|----------|---------|-------------|
| `S3_ENDPOINT` | `http://localhost:9000` | MinIO / S3 endpoint |
| `S3_BUCKET` | `loverace-media` | Media bucket name |
| `S3_ACCESS_KEY` | `minioadmin` | S3 access key |
| `S3_SECRET_KEY` | `minioadmin` | S3 secret key |
| `MODERATION_ENABLED` | `false` | Enable image moderation pipeline |

### Microservice B (`realtime_gateway`)

| Variable | Example | Description |
|----------|---------|-------------|
| `PG_NOTIFY_CHANNEL` | `loverace_events` | PostgreSQL NOTIFY channel for inter-service events |
| `BOND_NOTIFY_CHANNEL` | `bond_updates` | PostgreSQL NOTIFY channel for bond XP events |
| `XP_LOCK_SECONDS` | `10` | Seconds for the 10s unique-word rate limit |
| `XP_CAP_PER_MSG` | `30` | Max new tokens counted per message (anti-cheat cap) |

### Frontend

| Variable | Example | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000` | core_api base URL |
| `VITE_WS_URL` | `ws://localhost:8001` | realtime_gateway WebSocket URL |
| `VITE_DUMMY_DATA` | `false` | Enable dummy data mode |
| `VITE_MAP_STYLE_URL` | (MapLibre OSM style URL) | Map tile style |

---

## API Overview

### Microservice A — REST (`/v1/`)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/v1/auth/register` | Create account |
| `POST` | `/v1/auth/login` | Login, returns JWT |
| `POST` | `/v1/auth/refresh` | Refresh JWT |
| `GET` | `/v1/profiles/{id}` | Get a user's profile |
| `PATCH` | `/v1/profiles/me` | Update own profile |
| `POST` | `/v1/profiles/me/photos` | Upload photo |
| `POST` | `/v1/location` | Update GPS location |
| `GET` | `/v1/radar` | Get nearby users `?lat=&lng=&radius=` |
| `GET` | `/v1/feed` | Get ranked swipe card deck |
| `POST` | `/v1/swipes` | Record a swipe `{toUserId, direction}` |
| `POST` | `/v1/swipes/undo` | Undo last swipe |
| `GET` | `/v1/matches` | List matches |
| `GET` | `/v1/likes/received` | Who swiped right on me |
| `POST` | `/v1/matches/{id}/block` | Block a match |
| `GET` | `/v1/settings` | Get user settings |
| `PATCH` | `/v1/settings` | Update settings |

### Microservice B — WebSocket (`wss://host:8001/ws`)

| Direction | Event | Payload |
|-----------|-------|---------|
| client → server | `message.send` | `{conversationId, text}` |
| server → client | `message.received` | `{id, senderId, text, createdAt}` |
| client → server | `typing.start` | `{conversationId}` |
| server → client | `typing.indicator` | `{conversationId, userId}` |
| server → client | `match.created` | `{matchId, otherUser}` |
| server → client | `bond.progress` | `{matchId, stage, level, xpAdded}` |
| server → client | `bond.stage_pending` | `{matchId, currentStage, nextStage}` |
| client → server | `bond.confirm` | `{matchId}` |
| server → client | `bond.stage_upgraded` | `{matchId, newStage}` |
| server → client | `radar.appear` | `{userId, distanceBucket, avatarUrl}` |
| server → client | `radar.leave` | `{userId}` |
| server → client | `presence.update` | `{userId, online}` |

---

## Privacy & Safety

- **Fuzzy distances**: default to rounded distance buckets (±50–200m); users must opt-in to show exact distance.
- **Incognito mode**: users can go off-radar while still browsing.
- **Age gate**: registration requires date-of-birth; 18+ enforced server-side.
- **Photo moderation**: photos are screened before appearing on other profiles.
- **Block & report**: instant block hides all content from both sides; reports go to moderation queue.
- **Data deletion**: full account + data purge available in settings (GDPR / CCPA compliant).
- **Encrypted in transit**: HTTPS and WSS enforced in production; all passwords hashed with Argon2.

---

## Contributing

1. Fork the repository and create your branch: `git checkout -b feat/my-feature`.
2. Add or update tests alongside your code.
3. For any schema changes, add an Alembic migration in `services/core_api/alembic/`.
4. Document new env vars in the table above.
5. Open a PR with a clear description and screenshots/recordings for UI changes.

**Branch naming**: `feat/`, `fix/`, `chore/`, `refactor/` prefixes.
**Commit style**: Conventional Commits (`feat: add radar sweep animation`).

---

## License

MIT © 2026 Loverace Project

> **Important**: Before going live, ensure full compliance with local dating app regulations, age verification laws, data protection requirements (GDPR / CCPA), and content moderation obligations. This repository is a prototype — use responsibly.
