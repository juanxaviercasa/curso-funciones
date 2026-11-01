CREATE TABLE lesson_assets(
 id TEXT PRIMARY KEY,
 lesson_id TEXT NOT NULL REFERENCES lessons(id),
 kind TEXT NOT NULL CHECK(kind IN ('video','material')),
 object_key TEXT NOT NULL UNIQUE,
 filename TEXT NOT NULL,
 size_bytes INTEGER NOT NULL CHECK(size_bytes>0),
 created_by TEXT NOT NULL REFERENCES users(id),
 created_at TEXT NOT NULL
);
CREATE INDEX lesson_assets_lesson ON lesson_assets(lesson_id,kind,created_at);
