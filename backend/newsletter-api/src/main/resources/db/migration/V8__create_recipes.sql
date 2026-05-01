CREATE TABLE recipes (
    id          BIGSERIAL PRIMARY KEY,
    post_id     BIGINT REFERENCES posts(id) ON DELETE SET NULL,
    name        VARCHAR(255) NOT NULL,
    slug        VARCHAR(255) NOT NULL UNIQUE,
    ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
    steps       JSONB NOT NULL DEFAULT '[]'::jsonb,
    cook_time   VARCHAR(50),
    rating      SMALLINT,
    photo_url   TEXT,
    date_made   DATE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
