CREATE TABLE reactions (
    id          BIGSERIAL PRIMARY KEY,
    post_id     BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    emoji       VARCHAR(10) NOT NULL,
    session_id  VARCHAR(64) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(post_id, session_id)
);

CREATE INDEX idx_reactions_post ON reactions(post_id);
