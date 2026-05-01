CREATE TABLE admin_audit_log (
    id           BIGSERIAL PRIMARY KEY,
    action       VARCHAR(50) NOT NULL,
    entity_type  VARCHAR(50) NOT NULL,
    entity_id    BIGINT,
    detail       JSONB,
    performed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_action ON admin_audit_log(action);
CREATE INDEX idx_audit_time ON admin_audit_log(performed_at DESC);
