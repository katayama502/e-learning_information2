-- Add metadata column if not exists (Idempotent)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Force enable RLS on messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Re-create the update policy to ensure it's correct
DROP POLICY IF EXISTS "Participants can update messages" ON messages;

CREATE POLICY "Participants can update messages" ON messages
  FOR UPDATE USING (
    exists (
      select 1 from casual_chats
      where casual_chats.id = messages.chat_id
      and (
        casual_chats.user_id = auth.uid()
        or exists (
          select 1 from organization_members
          where organization_members.organization_id = casual_chats.company_id
          and organization_members.user_id = auth.uid()
        )
      )
    )
  ) WITH CHECK (
    exists (
      select 1 from casual_chats
      where casual_chats.id = messages.chat_id
      and (
        casual_chats.user_id = auth.uid()
        or exists (
          select 1 from organization_members
          where organization_members.organization_id = casual_chats.company_id
          and organization_members.user_id = auth.uid()
        )
      )
    )
  );

-- Also verify SELECT policy exists (it should, but just in case)
-- We don't drop it here to avoid disruption if it's named differently, 
-- but we rely on "Participants can view messages" from 20260125.
