CREATE TABLE highlights (
  slug  TEXT    NOT NULL,
  key   TEXT    NOT NULL,
  text  TEXT    DEFAULT '',
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (slug, key)
);
