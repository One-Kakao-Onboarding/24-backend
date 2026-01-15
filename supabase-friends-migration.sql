-- 1. Create the 'friends' table
CREATE TABLE IF NOT EXISTS friends (
  id TEXT PRIMARY KEY, -- Using TEXT for the id to match the format 'lucy.id'
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  job TEXT,
  gender TEXT,
  company TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Add 'friend_id' column to the 'messages' table
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS friend_id TEXT;

-- 3. Add a foreign key constraint to link messages to friends
--    (Optional, but good for data integrity)
--    Note: This assumes you have an entry in 'friends' for every 'friend_id' in 'messages'.
--    If not, you might need to add the friends first before applying this.
-- ALTER TABLE messages
-- ADD CONSTRAINT fk_friend_id
-- FOREIGN KEY (friend_id) REFERENCES friends(id);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_friend_id ON messages(friend_id);
