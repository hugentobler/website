DROP TABLE IF EXISTS visits;

CREATE TABLE visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT NOT NULL,
  city TEXT DEFAULT '',
  country TEXT DEFAULT '',
  timestamp INTEGER NOT NULL
);

CREATE INDEX idx_visits_path_timestamp ON visits (path, timestamp DESC);
