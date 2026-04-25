-- 1. Create a migration file to fix RLS policies for messages and chats

-- We noticed that although there were policies for casual_chats and messages, 
-- they might be missing explicit INSERT permissions or having issues with the exists subqueries.

-- Ensure RLS is enabled
ALTER TABLE casual_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 2. CASUAL CHATS POLICIES
DROP POLICY IF EXISTS "Users can create chats" ON casual_chats;
CREATE POLICY "Users can create chats" ON casual_chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own chats" ON casual_chats;
CREATE POLICY "Users can view own chats" ON casual_chats
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Company members can view own chats" ON casual_chats;
CREATE POLICY "Company members can view own chats" ON casual_chats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = casual_chats.company_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- 3. MESSAGES POLICIES
-- We need to ensure that participants can INSERT (send) messages
DROP POLICY IF EXISTS "Participants can send messages" ON messages;
CREATE POLICY "Participants can send messages" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM casual_chats
      WHERE casual_chats.id = messages.chat_id
      AND (
        casual_chats.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM organization_members
          WHERE organization_members.organization_id = casual_chats.company_id
          AND organization_members.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Participants can view messages" ON messages;
CREATE POLICY "Participants can view messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM casual_chats
      WHERE casual_chats.id = messages.chat_id
      AND (
        casual_chats.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM organization_members
          WHERE organization_members.organization_id = casual_chats.company_id
          AND organization_members.user_id = auth.uid()
        )
      )
    )
  );

-- Add UPDATE policy for marking as read
DROP POLICY IF EXISTS "Participants can update messages" ON messages;
CREATE POLICY "Participants can update messages" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM casual_chats
      WHERE casual_chats.id = messages.chat_id
      AND (
        casual_chats.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM organization_members
          WHERE organization_members.organization_id = casual_chats.company_id
          AND organization_members.user_id = auth.uid()
        )
      )
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM casual_chats
      WHERE casual_chats.id = messages.chat_id
      AND (
        casual_chats.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM organization_members
          WHERE organization_members.organization_id = casual_chats.company_id
          AND organization_members.user_id = auth.uid()
        )
      )
    )
  );
