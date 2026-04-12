-- =============================================================
-- db/schema.sql  (v2 — adds auth fields to users)
-- PostgreSQL schema for Movie Recommendation System
-- Run: psql -U postgres -d moviedb -f db/schema.sql
-- =============================================================

-- ── Users ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            BIGSERIAL    PRIMARY KEY,
    username      VARCHAR(100) NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,           -- BCrypt hash
    role          VARCHAR(20)  NOT NULL DEFAULT 'USER',  -- USER | ADMIN
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ── Movies ─────────────────────────────────────────────────────
-- movie_id matches the ORIGINAL MovieLens ID (1-based, from u.item)
CREATE TABLE IF NOT EXISTS movies (
    id         BIGINT       PRIMARY KEY,   -- original ML-100K movie_id
    title      VARCHAR(512) NOT NULL,
    genres     VARCHAR(512),               -- pipe-separated, e.g. "Action|Drama"
    avg_rating DOUBLE PRECISION DEFAULT 0.0,
    poster_url VARCHAR(1024)
);

-- ── Ratings ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ratings (
    id         BIGSERIAL        PRIMARY KEY,
    user_id    BIGINT           NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    movie_id   BIGINT           NOT NULL REFERENCES movies(id)  ON DELETE CASCADE,
    rating     DOUBLE PRECISION NOT NULL CHECK (rating >= 1.0 AND rating <= 5.0),
    rated_at   TIMESTAMP        NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, movie_id)  -- one rating per user per movie
);

-- ── Indexes ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ratings_user    ON ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_movie   ON ratings(movie_id);
CREATE INDEX IF NOT EXISTS idx_movies_title    ON movies USING gin(to_tsvector('english', title));

-- ── Default admin account ───────────────────────────────────────
-- password: admin123  (BCrypt hash below, change before going live)
INSERT INTO users (username, email, password_hash, role)
VALUES ('admin', 'admin@movierecommender.com',
        '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN')
ON CONFLICT (username) DO NOTHING;
