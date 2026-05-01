CREATE TABLE issues (
    id                BIGSERIAL PRIMARY KEY,
    month             SMALLINT NOT NULL,
    year              SMALLINT NOT NULL,
    title             VARCHAR(255) NOT NULL,
    slug              VARCHAR(255) NOT NULL UNIQUE,
    layout_preference VARCHAR(20) NOT NULL DEFAULT 'newspaper',
    status            VARCHAR(20) NOT NULL DEFAULT 'draft',
    cover_image_url   TEXT,
    created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(month, year)
);
