CREATE TABLE site_settings (
    key   VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL
);

INSERT INTO site_settings (key, value) VALUES
('site_name', 'Eva''s Newsletter'),
('publication_name', 'The Eva Times'),
('ko_fi_url', ''),
('default_layout', 'newspaper'),
('admin_email', ''),
('error_alert_threshold', '10');
