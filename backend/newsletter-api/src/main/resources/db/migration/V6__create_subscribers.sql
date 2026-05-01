CREATE TABLE subscribers (
    id                 BIGSERIAL PRIMARY KEY,
    email              VARCHAR(255) NOT NULL UNIQUE,
    display_name       VARCHAR(100),
    status             VARCHAR(20) NOT NULL DEFAULT 'pending',
    source             VARCHAR(255),
    confirmation_token VARCHAR(64),
    token_expires_at   TIMESTAMP,
    confirmed_at       TIMESTAMP,
    unsubscribed_at    TIMESTAMP,
    unsubscribe_token  VARCHAR(64),
    created_at         TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscribers_status ON subscribers(status);
CREATE INDEX idx_subscribers_token ON subscribers(confirmation_token);
CREATE INDEX idx_subscribers_unsub_token ON subscribers(unsubscribe_token);
