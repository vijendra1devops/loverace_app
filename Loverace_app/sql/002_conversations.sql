-- ============================================================
-- Loverace – Conversations & Bond system (002)
-- ============================================================

-- ----------------------------------------------------------
-- conversations  (one per match)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS conversations (
    id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id   UUID        UNIQUE NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
-- messages
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text            TEXT        NOT NULL,
    media_url       TEXT,
    counted         BOOLEAN     NOT NULL DEFAULT FALSE,   -- TRUE if this msg scored XP
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
-- bond_progress  (per user per conversation)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS bond_progress (
    conversation_id      UUID        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id              UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stage                INTEGER     NOT NULL DEFAULT 1 CHECK (stage BETWEEN 1 AND 4),
    stage_xp             INTEGER     NOT NULL DEFAULT 0  CHECK (stage_xp >= 0),
    level                INTEGER     NOT NULL DEFAULT 1  CHECK (level BETWEEN 1 AND 101),
    pending_confirmation BOOLEAN     NOT NULL DEFAULT FALSE,
    confirmed_upgrade    BOOLEAN     NOT NULL DEFAULT FALSE,
    last_updated         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);

-- ----------------------------------------------------------
-- bond_vocab  (words already counted per user per conversation)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS bond_vocab (
    conversation_id UUID        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    word            VARCHAR(150) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id, word)
);

-- ----------------------------------------------------------
-- bond_rate_limit  (10-second lock per user per conversation)
-- Row is upserted on each message attempt; WHERE clause on
-- upsert enforces the 10s window (see xp_engine.py).
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS bond_rate_limit (
    conversation_id UUID        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_counted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);
