CREATE TABLE question_drafts(
 id TEXT PRIMARY KEY,
 lesson_id TEXT NOT NULL REFERENCES lessons(id),
 payload_json TEXT NOT NULL,
 revision INTEGER NOT NULL DEFAULT 1 CHECK(revision>0),
 created_by TEXT NOT NULL REFERENCES users(id),
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX question_drafts_updated ON question_drafts(updated_at);
