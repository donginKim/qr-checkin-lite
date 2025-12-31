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
  status        TEXT NOT NULL,
  created_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS attendances (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id     TEXT NOT NULL,
  participant_id INTEGER NOT NULL,
  checked_in_at  TEXT NOT NULL,
  ip             TEXT,
  user_agent     TEXT,
  UNIQUE(session_id, participant_id)
);
