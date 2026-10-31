CREATE TABLE course_structure_drafts(
 sku TEXT PRIMARY KEY REFERENCES products(sku),
 payload_json TEXT NOT NULL,
 revision INTEGER NOT NULL CHECK(revision>0),
 updated_by TEXT NOT NULL REFERENCES users(id),
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
