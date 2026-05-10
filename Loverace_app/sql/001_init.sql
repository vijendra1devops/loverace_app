-- ============================================================
-- Loverace – Schema init (001)
-- Run after enabling the postgis extension on your database.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------
-- users
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    email         VARCHAR(255) UNIQUE NOT NULL,
    phone_hash    VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    status        VARCHAR(20)  NOT NULL DEFAULT 'active'
                               CHECK (status IN ('active', 'suspended', 'deleted')),
    is_verified   BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    last_active   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
-- profiles  (14+ user-facing fields)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    user_id            UUID         PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    display_name       VARCHAR(100) NOT NULL,
    date_of_birth      DATE         NOT NULL,
    gender_identity    VARCHAR(100),
    pronouns           VARCHAR(100),
    sexual_orientation TEXT[]       NOT NULL DEFAULT '{}',
    looking_for        TEXT[]       NOT NULL DEFAULT '{}',
    bio                TEXT,
    photos             JSONB        NOT NULL DEFAULT '[]',
    interests          JSONB        NOT NULL DEFAULT '[]',
    height_cm          INTEGER      CHECK (height_cm BETWEEN 100 AND 250),
    education          VARCHAR(200),
    job_title          VARCHAR(200),
    languages          TEXT[]       NOT NULL DEFAULT '{}',
    smoking            VARCHAR(30)  CHECK (smoking IN ('never','sometimes','regularly','prefer_not_to_say')),
    drinking           VARCHAR(30)  CHECK (drinking IN ('never','socially','regularly','prefer_not_to_say')),
    privacy_settings   JSONB        NOT NULL DEFAULT '{}',
    preferences        JSONB        NOT NULL DEFAULT '{}',
    updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
-- user_settings
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_settings (
    user_id               UUID        PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    sound_enabled         BOOLEAN     NOT NULL DEFAULT TRUE,
    vibrate_enabled       BOOLEAN     NOT NULL DEFAULT TRUE,
    reduce_motion         BOOLEAN     NOT NULL DEFAULT FALSE,
    show_online_status    BOOLEAN     NOT NULL DEFAULT TRUE,
    notifications_enabled BOOLEAN     NOT NULL DEFAULT TRUE,
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
-- locations  (PostGIS geography)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS locations (
    user_id    UUID         PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    geom       GEOGRAPHY(POINT, 4326) NOT NULL,
    accuracy_m INTEGER,
    visibility VARCHAR(15)  NOT NULL DEFAULT 'approximate'
                            CHECK (visibility IN ('public', 'approximate', 'hidden')),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
-- swipes
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS swipes (
    id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_user_id UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    direction    VARCHAR(10) NOT NULL CHECK (direction IN ('like', 'dislike', 'superlike')),
    source       VARCHAR(10) NOT NULL DEFAULT 'feed' CHECK (source IN ('radar', 'feed')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (from_user_id, to_user_id)
);

-- ----------------------------------------------------------
-- matches  (user_a < user_b enforced in application layer)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS matches (
    id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_a_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_b_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    matched_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
    blocked_by_a BOOLEAN     NOT NULL DEFAULT FALSE,
    blocked_by_b BOOLEAN     NOT NULL DEFAULT FALSE,
    UNIQUE (user_a_id, user_b_id)
);

-- ----------------------------------------------------------
-- blocked_users
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS blocked_users (
    blocker_id UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_id UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (blocker_id, blocked_id)
);
