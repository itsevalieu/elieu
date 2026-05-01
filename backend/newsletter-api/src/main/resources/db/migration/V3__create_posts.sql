CREATE TABLE posts (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(500) NOT NULL,
    slug            VARCHAR(500) NOT NULL UNIQUE,
    excerpt         TEXT,
    body            TEXT NOT NULL,
    category_id     BIGINT REFERENCES categories(id),
    subcategory_id  BIGINT REFERENCES subcategories(id),
    cover_image_url TEXT,
    gallery_urls    JSONB DEFAULT '[]'::jsonb,
    video_url       TEXT,
    video_type      VARCHAR(20),
    status          VARCHAR(20) NOT NULL DEFAULT 'draft',
    format          VARCHAR(30) NOT NULL DEFAULT 'article',
    layout_hint     VARCHAR(20) NOT NULL DEFAULT 'column',
    issue_id        BIGINT REFERENCES issues(id),
    tags            JSONB DEFAULT '[]'::jsonb,
    published_at    TIMESTAMP,
    comment_count   INT NOT NULL DEFAULT 0,
    reaction_counts JSONB DEFAULT '{}'::jsonb,
    quote_author    VARCHAR(255),
    quote_source    VARCHAR(500),
    game_url        TEXT,
    game_type       VARCHAR(10),
    view_count      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_issue ON posts(issue_id);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_published ON posts(published_at DESC);
CREATE INDEX idx_posts_slug ON posts(slug);
