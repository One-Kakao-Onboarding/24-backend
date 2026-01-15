-- TalkLog Database Schema for Supabase

-- Messages table to store chat conversations
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_user_created ON messages(user_id, created_at DESC);

-- Diaries table to store generated picture diaries
CREATE TABLE IF NOT EXISTS diaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  summary TEXT NOT NULL,
  image_url TEXT,
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_diaries_user_id ON diaries(user_id);
CREATE INDEX IF NOT EXISTS idx_diaries_created_at ON diaries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diaries_user_created ON diaries(user_id, created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_diaries_updated_at ON diaries;
CREATE TRIGGER update_diaries_updated_at
  BEFORE UPDATE ON diaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;

-- Policies for anonymous access (you can customize based on your auth needs)
CREATE POLICY "Allow all operations on messages" ON messages
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on diaries" ON diaries
  FOR ALL USING (true) WITH CHECK (true);

-- If you want to add authentication later, you can modify policies like:
-- CREATE POLICY "Users can only access their own messages" ON messages
--   FOR ALL USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
