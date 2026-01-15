-- Add friend_id column to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS friend_id TEXT;

-- Add index for faster queries with friend_id
CREATE INDEX IF NOT EXISTS idx_messages_user_friend ON messages(user_id, friend_id, created_at DESC);
