-- Create Table
CREATE TABLE events (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  probe_id TEXT NOT NULL,
  response_status INTEGER,
  response_time INTEGER NOT NULL,
  response_size INTEGER,
  error TEXT,
  reported INTEGER DEFAULT 0
);