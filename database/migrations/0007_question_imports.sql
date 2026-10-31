CREATE TABLE question_import_keys(source_namespace TEXT NOT NULL,external_id TEXT NOT NULL,draft_id TEXT NOT NULL UNIQUE REFERENCES question_drafts(id),PRIMARY KEY(source_namespace,external_id));
