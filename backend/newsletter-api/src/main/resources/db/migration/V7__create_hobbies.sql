CREATE TABLE hobbies (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    category   VARCHAR(100),
    started_at DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE hobby_progress_entries (
    id         BIGSERIAL PRIMARY KEY,
    hobby_id   BIGINT NOT NULL REFERENCES hobbies(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    note       TEXT,
    milestone  BOOLEAN NOT NULL DEFAULT FALSE,
    photo_url  TEXT,
    metadata   JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hobby_entries_hobby ON hobby_progress_entries(hobby_id);
