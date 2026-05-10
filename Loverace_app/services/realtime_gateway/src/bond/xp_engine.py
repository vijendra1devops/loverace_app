"""
Bond XP engine — pure Python + PostgreSQL, no Redis.

Algorithm
---------
1. Normalize message text → set of tokens.
2. Enforce 10-second rate limit using an UPSERT with a WHERE clause
   on `bond_rate_limit`. If the row was updated within the last XP_LOCK_SECONDS
   the UPSERT is a no-op and RETURNING returns nothing → rate limited.
3. Find new tokens not yet in `bond_vocab` for this (conversation, user).
4. Persist new tokens.
5. Increment `bond_progress.stage_xp`, recalculate level, detect stage completion.
6. Fire pg_notify('bond_updates', payload) so the WS gateway can push to clients.

Leveling formula
----------------
    words_needed(level L, stage S) = 10 + (L-1)*2 + (S-1)*50

Stage names: 1=Dating, 2=Couples, 3=Soulmate, 4=Lovers
Levels per stage: 1–101. After level 101 both users must confirm to advance stage.
"""
import json
import re
from typing import Any

import asyncpg

from src.config import settings

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
STAGE_NAMES      = {1: "Dating", 2: "Couples", 3: "Soulmate", 4: "Lovers"}
LEVELS_PER_STAGE = 101
MAX_STAGE        = 4

STOPWORDS = {
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "is", "was", "are", "be", "been", "i", "you", "he",
    "she", "it", "we", "they", "my", "your", "its", "our", "their", "this",
    "that", "not", "no", "so", "do", "did", "has", "have", "had", "will",
    "would", "can", "could", "may", "might", "shall", "should", "am",
}


# ---------------------------------------------------------------------------
# Pure helpers
# ---------------------------------------------------------------------------
def words_needed(level: int, stage: int) -> int:
    """Unique words required to advance from `level` to `level + 1`."""
    return 10 + (level - 1) * 2 + (stage - 1) * 50


def xp_to_level(stage_xp: int, stage: int) -> int:
    """Derive current level (1–101) from accumulated stage XP."""
    level, cumulative = 1, 0
    while level < LEVELS_PER_STAGE:
        needed = words_needed(level, stage)
        if cumulative + needed > stage_xp:
            break
        cumulative += needed
        level += 1
    return level


def normalize_tokens(text: str) -> set[str]:
    """Lowercase, strip punctuation/URLs, remove stopwords, return unique words."""
    text = text.lower()
    text = re.sub(r"https?://\S+", "", text)
    text = re.sub(r"[^\w\s]", "", text)
    return {t for t in text.split() if len(t) >= 2 and t not in STOPWORDS}


# ---------------------------------------------------------------------------
# Main async function
# ---------------------------------------------------------------------------
async def process_message_xp(
    pool: asyncpg.Pool,
    conversation_id: str,
    sender_id: str,
    message_text: str,
) -> dict[str, Any]:
    """
    Award XP for a chat message.

    Returns a dict with:
        xp_awarded, rate_limited, level, stage, stage_name,
        words_to_next_level, pending_confirmation
    """
    tokens = normalize_tokens(message_text)

    async with pool.acquire() as conn:
        async with conn.transaction():

            # ── 1. Enforce 10-second rate limit ────────────────────────────
            lock_row = await conn.fetchrow(
                """
                INSERT INTO bond_rate_limit (conversation_id, user_id, last_counted_at)
                VALUES ($1::uuid, $2::uuid, NOW())
                ON CONFLICT (conversation_id, user_id) DO UPDATE
                    SET last_counted_at = NOW()
                    WHERE bond_rate_limit.last_counted_at
                          < NOW() - ($3 * INTERVAL '1 second')
                RETURNING last_counted_at
                """,
                conversation_id,
                sender_id,
                settings.XP_LOCK_SECONDS,
            )

            current = await _current_progress(conn, conversation_id, sender_id)
            if lock_row is None:
                # Rate limited — message is delivered but scores 0 XP
                return {"xp_awarded": 0, "rate_limited": True, **current}

            if not tokens:
                return {"xp_awarded": 0, "rate_limited": False, **current}

            # ── 2. Find tokens not yet seen in this conversation/user ──────
            existing = await conn.fetch(
                "SELECT word FROM bond_vocab "
                "WHERE conversation_id=$1::uuid AND user_id=$2::uuid",
                conversation_id,
                sender_id,
            )
            seen       = {r["word"] for r in existing}
            new_tokens = list(tokens - seen)[: settings.XP_CAP_PER_MSG]
            xp_awarded = len(new_tokens)

            if xp_awarded == 0:
                return {"xp_awarded": 0, "rate_limited": False, **current}

            # ── 3. Persist new vocabulary ───────────────────────────────────
            await conn.executemany(
                "INSERT INTO bond_vocab (conversation_id, user_id, word) "
                "VALUES ($1::uuid, $2::uuid, $3) ON CONFLICT DO NOTHING",
                [(conversation_id, sender_id, w) for w in new_tokens],
            )

            # ── 4. Update XP and recalculate level ──────────────────────────
            progress = await conn.fetchrow(
                """
                UPDATE bond_progress
                SET stage_xp = stage_xp + $3
                WHERE conversation_id=$1::uuid AND user_id=$2::uuid
                RETURNING stage, stage_xp, pending_confirmation
                """,
                conversation_id,
                sender_id,
                xp_awarded,
            )

            if not progress:
                # Seed missing row (shouldn't happen, but defensive)
                await conn.execute(
                    """
                    INSERT INTO bond_progress
                        (conversation_id, user_id, stage, stage_xp, level)
                    VALUES ($1::uuid, $2::uuid, 1, $3, 1)
                    ON CONFLICT DO NOTHING
                    """,
                    conversation_id,
                    sender_id,
                    xp_awarded,
                )
                progress = await conn.fetchrow(
                    "SELECT stage, stage_xp, pending_confirmation FROM bond_progress "
                    "WHERE conversation_id=$1::uuid AND user_id=$2::uuid",
                    conversation_id, sender_id,
                )

            stage    = progress["stage"]
            stage_xp = progress["stage_xp"]
            level    = xp_to_level(stage_xp, stage)
            capped   = min(level, LEVELS_PER_STAGE)
            pending  = capped >= LEVELS_PER_STAGE and stage < MAX_STAGE

            await conn.execute(
                """
                UPDATE bond_progress
                SET level = $3, pending_confirmation = $4
                WHERE conversation_id=$1::uuid AND user_id=$2::uuid
                """,
                conversation_id,
                sender_id,
                capped,
                pending,
            )

            # ── 5. Mark the triggering message as counted ──────────────────
            # (caller must pass message_id if available; skipped here)

            # ── 6. Notify WS gateway via PostgreSQL LISTEN/NOTIFY ──────────
            payload = json.dumps({
                "event":            "bond.progress",
                "conversation_id":  conversation_id,
                "user_id":          sender_id,
                "xp_awarded":       xp_awarded,
                "level":            capped,
                "stage":            stage,
                "stage_name":       STAGE_NAMES[stage],
                "pending":          pending,
                "words_to_next":    words_needed(capped, stage),
            })
            await conn.execute(
                "SELECT pg_notify($1, $2)",
                settings.BOND_NOTIFY_CHANNEL,
                payload,
            )

    return {
        "xp_awarded":           xp_awarded,
        "rate_limited":         False,
        "level":                capped,
        "stage":                stage,
        "stage_name":           STAGE_NAMES[stage],
        "words_to_next_level":  words_needed(capped, stage),
        "pending_confirmation": pending,
    }


async def confirm_stage_upgrade(
    pool: asyncpg.Pool,
    conversation_id: str,
    user_id: str,
) -> dict[str, Any]:
    """
    Mark one user's confirmation for a stage upgrade.
    If both users have confirmed, advance the stage and reset XP.
    Returns the updated progress dict.
    """
    async with pool.acquire() as conn:
        async with conn.transaction():
            # Mark this user as confirmed
            await conn.execute(
                """
                UPDATE bond_progress
                SET confirmed_upgrade = TRUE
                WHERE conversation_id=$1::uuid AND user_id=$2::uuid
                  AND pending_confirmation = TRUE
                """,
                conversation_id,
                user_id,
            )

            # Check whether both users have confirmed
            rows = await conn.fetch(
                """
                SELECT user_id::text, stage, pending_confirmation, confirmed_upgrade
                FROM bond_progress
                WHERE conversation_id=$1::uuid
                """,
                conversation_id,
            )

            if len(rows) == 2 and all(r["confirmed_upgrade"] for r in rows):
                current_stage = rows[0]["stage"]
                new_stage     = min(current_stage + 1, MAX_STAGE)

                # Advance both users to next stage, reset XP
                await conn.execute(
                    """
                    UPDATE bond_progress
                    SET stage             = $2,
                        stage_xp          = 0,
                        level             = 1,
                        pending_confirmation = FALSE,
                        confirmed_upgrade = FALSE
                    WHERE conversation_id=$1::uuid
                    """,
                    conversation_id,
                    new_stage,
                )

                # Notify both users of stage upgrade
                for row in rows:
                    payload = json.dumps({
                        "event":           "bond.stage_upgraded",
                        "conversation_id": conversation_id,
                        "user_id":         row["user_id"],
                        "new_stage":       new_stage,
                        "new_stage_name":  STAGE_NAMES[new_stage],
                    })
                    await conn.execute(
                        "SELECT pg_notify($1, $2)",
                        settings.BOND_NOTIFY_CHANNEL,
                        payload,
                    )

    return await _current_progress_by_pool(pool, conversation_id, user_id)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------
async def _current_progress(
    conn: asyncpg.Connection,
    conversation_id: str,
    sender_id: str,
) -> dict[str, Any]:
    row = await conn.fetchrow(
        "SELECT stage, stage_xp, level, pending_confirmation "
        "FROM bond_progress "
        "WHERE conversation_id=$1::uuid AND user_id=$2::uuid",
        conversation_id,
        sender_id,
    )
    if not row:
        return {
            "level":                1,
            "stage":                1,
            "stage_name":           "Dating",
            "words_to_next_level":  10,
            "pending_confirmation": False,
        }
    level = row["level"] or 1
    stage = row["stage"] or 1
    return {
        "level":                level,
        "stage":                stage,
        "stage_name":           STAGE_NAMES.get(stage, "Dating"),
        "words_to_next_level":  words_needed(level, stage),
        "pending_confirmation": bool(row["pending_confirmation"]),
    }


async def _current_progress_by_pool(
    pool: asyncpg.Pool,
    conversation_id: str,
    sender_id: str,
) -> dict[str, Any]:
    async with pool.acquire() as conn:
        return await _current_progress(conn, conversation_id, sender_id)
