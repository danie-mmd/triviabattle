-- TriviaBattle Database Schema
-- Flyway migration: V1__init.sql

-- ── Users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              BIGINT       NOT NULL,           -- Telegram user ID
    username        VARCHAR(64),
    first_name      VARCHAR(128) NOT NULL,
    last_name       VARCHAR(128),
    photo_url       TEXT,
    language_code   VARCHAR(8),
    is_premium      TINYINT(1)   NOT NULL DEFAULT 0,
    wallet_address  VARCHAR(128),                   -- Connected TON wallet
    power_up_ink_blot   INT      NOT NULL DEFAULT 0,
    power_up_freeze     INT      NOT NULL DEFAULT 0,
    power_up_double     INT      NOT NULL DEFAULT 0,
    stars_balance       INT      NOT NULL DEFAULT 0,
    games_played        INT      NOT NULL DEFAULT 0,
    games_won           INT      NOT NULL DEFAULT 0,
    total_ton_won   DECIMAL(18,9) NOT NULL DEFAULT 0,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Questions ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS questions (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    question_text   TEXT         NOT NULL,
    option_a        VARCHAR(512) NOT NULL,
    option_b        VARCHAR(512) NOT NULL,
    option_c        VARCHAR(512) NOT NULL,
    option_d        VARCHAR(512) NOT NULL,
    correct_index   TINYINT      NOT NULL,           -- 0=A, 1=B, 2=C, 3=D
    category        VARCHAR(64)  NOT NULL DEFAULT 'General',
    difficulty      ENUM('easy','medium','hard') NOT NULL DEFAULT 'medium',
    region          ENUM('south_africa','global')    NOT NULL DEFAULT 'global',
    source_date     DATE,                            -- Date of the event/news
    content_hash    CHAR(64)     NOT NULL,           -- SHA256 of question_text for dedup
    active          TINYINT(1)   NOT NULL DEFAULT 1,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_content_hash (content_hash),
    INDEX idx_active_difficulty (active, difficulty),
    INDEX idx_source_date (source_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Tournaments ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tournaments (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    room_id         VARCHAR(32)  NOT NULL,           -- Redis room ID
    state           ENUM('WAITING','QUESTION_ACTIVE','INTERMISSION','GAME_OVER') NOT NULL DEFAULT 'WAITING',
    prize_pool_nano BIGINT       NOT NULL DEFAULT 0, -- Prize in nanoTON
    entry_fee_nano  BIGINT       NOT NULL DEFAULT 500000000, -- 0.5 TON in nano
    winner_id       BIGINT,
    started_at      TIMESTAMP,
    ended_at        TIMESTAMP,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_room_id (room_id),
    INDEX idx_state (state),
    CONSTRAINT fk_tournament_winner FOREIGN KEY (winner_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Tournament Players ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tournament_players (
    tournament_id   BIGINT       NOT NULL,
    user_id         BIGINT       NOT NULL,
    final_score     INT          NOT NULL DEFAULT 0,
    player_rank     TINYINT,
    ton_payout_nano BIGINT       NOT NULL DEFAULT 0,
    paid            TINYINT(1)   NOT NULL DEFAULT 0,
    joined_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (tournament_id, user_id),
    CONSTRAINT fk_tp_tournament FOREIGN KEY (tournament_id) REFERENCES tournaments (id),
    CONSTRAINT fk_tp_user       FOREIGN KEY (user_id)       REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Tournament Questions ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tournament_questions (
    tournament_id   BIGINT   NOT NULL,
    question_id     BIGINT   NOT NULL,
    question_order  TINYINT  NOT NULL,
    PRIMARY KEY (tournament_id, question_id),
    CONSTRAINT fk_tq_tournament FOREIGN KEY (tournament_id) REFERENCES tournaments (id),
    CONSTRAINT fk_tq_question   FOREIGN KEY (question_id)   REFERENCES questions (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Answer Logs ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS answer_logs (
    id              BIGINT   NOT NULL AUTO_INCREMENT,
    tournament_id   BIGINT   NOT NULL,
    user_id         BIGINT   NOT NULL,
    question_id     BIGINT   NOT NULL,
    selected_index  TINYINT  NOT NULL,
    is_correct      TINYINT(1) NOT NULL,
    points_awarded  INT      NOT NULL DEFAULT 0,
    response_ms     INT      NOT NULL DEFAULT 0,     -- How fast the answer arrived
    answered_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_al_tournament (tournament_id),
    INDEX idx_al_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Power-Up Transactions ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS powerup_transactions (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    user_id         BIGINT       NOT NULL,
    product_type    VARCHAR(32)  NOT NULL,
    stars_paid      INT          NOT NULL,
    telegram_charge_id VARCHAR(128),
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_pt_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
