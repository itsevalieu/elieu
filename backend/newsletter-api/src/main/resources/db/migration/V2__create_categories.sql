CREATE TABLE categories (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    slug        VARCHAR(100) NOT NULL UNIQUE,
    sort_order  INT NOT NULL DEFAULT 0
);

CREATE TABLE subcategories (
    id          BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES categories(id),
    name        VARCHAR(100) NOT NULL,
    slug        VARCHAR(100) NOT NULL,
    UNIQUE(category_id, slug)
);

INSERT INTO categories (name, slug, sort_order) VALUES
('Writing', 'writing', 1),
('Projects', 'projects', 2),
('Reviews', 'reviews', 3),
('Life', 'life', 4),
('Tracking', 'tracking', 5),
('Games', 'games', 6);
