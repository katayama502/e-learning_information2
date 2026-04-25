-- Add metadata column to messages table for soft deletion and other extensions
ALTER TABLE messages ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Update existing messages to have empty metadata if null (optional, handled by default above)
-- UPDATE messages SET metadata = '{}'::jsonb WHERE metadata IS NULL;
