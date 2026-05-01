CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE achievements (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    context TEXT,
    achievement_date DATE NOT NULL,
    photo_url VARCHAR(2048),
    project_id BIGINT NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_achievements_project_id ON achievements (project_id);
