CREATE TABLE IF NOT EXISTS participants (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  phone_hash    TEXT NOT NULL,
  phone_last4   TEXT NOT NULL,
  created_at    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_participants_name_phonehash
  ON participants(name, phone_hash);

CREATE TABLE IF NOT EXISTS sessions (
  id            TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  session_date  TEXT NOT NULL,
  starts_at     TEXT NOT NULL,
  ends_at       TEXT NOT NULL,
  token_hash    TEXT NOT NULL,
  short_code    TEXT NOT NULL UNIQUE,
  status        TEXT NOT NULL,
  created_at    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_short_code ON sessions(short_code);

CREATE TABLE IF NOT EXISTS settings (
  key           TEXT PRIMARY KEY,
  value         TEXT NOT NULL
);

INSERT OR IGNORE INTO settings (key, value) VALUES ('church_name', '성당');
INSERT OR IGNORE INTO settings (key, value) VALUES ('simple_checkin_mode', 'false');
INSERT OR IGNORE INTO settings (key, value) VALUES ('logo_url', '');

CREATE TABLE IF NOT EXISTS attendances (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id     TEXT NOT NULL,
  session_title  TEXT NOT NULL,
  participant_id INTEGER NOT NULL,
  name           TEXT NOT NULL,
  phone          TEXT NOT NULL,
  phone_last4    TEXT NOT NULL,
  checked_in_at  TEXT NOT NULL,
  ip             TEXT,
  user_agent     TEXT,
  UNIQUE(session_id, participant_id)
);
