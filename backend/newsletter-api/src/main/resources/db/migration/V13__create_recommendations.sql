CREATE TABLE recommendations (
    id           BIGSERIAL PRIMARY KEY,
    type         VARCHAR(20) NOT NULL,
    title        VARCHAR(255) NOT NULL,
    note         TEXT,
    submitted_by VARCHAR(100),
    status       VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);
