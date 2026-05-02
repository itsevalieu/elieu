-- Allow users to react with multiple different emojis per post.
-- Old: UNIQUE(post_id, session_id) — one emoji per session per post
-- New: UNIQUE(post_id, session_id, emoji) — one of each emoji per session per post

ALTER TABLE reactions DROP CONSTRAINT reactions_post_id_session_id_key;
ALTER TABLE reactions ADD CONSTRAINT reactions_post_session_emoji_key UNIQUE (post_id, session_id, emoji);
