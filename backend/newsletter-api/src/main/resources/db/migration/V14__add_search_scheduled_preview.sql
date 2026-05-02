-- Full-text search: tsvector column + GIN index
ALTER TABLE posts ADD COLUMN search_vector tsvector;

UPDATE posts SET search_vector =
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(excerpt, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(body, '')), 'C');

CREATE INDEX idx_posts_search ON posts USING GIN (search_vector);

CREATE OR REPLACE FUNCTION posts_search_trigger() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.excerpt, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.body, '')), 'C');
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_posts_search
    BEFORE INSERT OR UPDATE OF title, excerpt, body ON posts
    FOR EACH ROW EXECUTE FUNCTION posts_search_trigger();

-- Scheduled publishing
ALTER TABLE posts ADD COLUMN scheduled_at TIMESTAMP;
CREATE INDEX idx_posts_scheduled ON posts(scheduled_at) WHERE status = 'scheduled';

-- Draft preview tokens
ALTER TABLE posts ADD COLUMN preview_token VARCHAR(64);
CREATE UNIQUE INDEX idx_posts_preview_token ON posts(preview_token) WHERE preview_token IS NOT NULL;
