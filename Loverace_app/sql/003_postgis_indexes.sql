-- ============================================================
-- Loverace – Indexes & helper triggers (003)
-- Run AFTER 001 and 002.
-- ============================================================

-- Spatial index for radar proximity queries
CREATE INDEX IF NOT EXISTS idx_locations_geom
    ON locations USING GIST(geom);

-- User lookup
CREATE INDEX IF NOT EXISTS idx_users_email
    ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_last_active
    ON users(last_active DESC);

-- Swipe lookups
CREATE INDEX IF NOT EXISTS idx_swipes_from_user
    ON swipes(from_user_id);
CREATE INDEX IF NOT EXISTS idx_swipes_to_user
    ON swipes(to_user_id);

-- Match lookups
CREATE INDEX IF NOT EXISTS idx_matches_user_a
    ON matches(user_a_id);
CREATE INDEX IF NOT EXISTS idx_matches_user_b
    ON matches(user_b_id);

-- Chat lookups
CREATE INDEX IF NOT EXISTS idx_messages_conversation
    ON messages(conversation_id, created_at DESC);

-- Bond vocab lookups
CREATE INDEX IF NOT EXISTS idx_bond_vocab_conv_user
    ON bond_vocab(conversation_id, user_id);

-- Bond progress lookups
CREATE INDEX IF NOT EXISTS idx_bond_progress_conv
    ON bond_progress(conversation_id);

-- ============================================================
-- Auto-update last_active when a user updates their location
-- ============================================================
CREATE OR REPLACE FUNCTION fn_touch_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users SET last_active = NOW() WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_location_touch_active ON locations;
CREATE TRIGGER trg_location_touch_active
    AFTER INSERT OR UPDATE ON locations
    FOR EACH ROW EXECUTE FUNCTION fn_touch_last_active();

-- ============================================================
-- Auto-update profiles.updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_bond_progress_updated ON bond_progress;
CREATE TRIGGER trg_bond_progress_updated
    BEFORE UPDATE ON bond_progress
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
