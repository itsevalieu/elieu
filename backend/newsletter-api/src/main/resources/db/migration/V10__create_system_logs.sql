CREATE TABLE system_logs (
    id          BIGSERIAL PRIMARY KEY,
    severity    VARCHAR(10) NOT NULL,
    service     VARCHAR(50) NOT NULL,
    message     TEXT NOT NULL,
    stack_trace TEXT,
    endpoint    VARCHAR(255),
    logged_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_syslogs_severity ON system_logs(severity);
CREATE INDEX idx_syslogs_time ON system_logs(logged_at DESC);
