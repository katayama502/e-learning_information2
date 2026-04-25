-- Ensure organization_members has RLS enabled and a Select policy
ALTER TABLE IF EXISTS organization_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view organization members" ON organization_members;

CREATE POLICY "Authenticated users can view organization members" ON organization_members
  FOR SELECT USING (auth.role() = 'authenticated');


-- Re-affirm messages SELECT policy to be sure
DROP POLICY IF EXISTS "Participants can view messages" ON messages;

CREATE POLICY "Participants can view messages" ON messages
  FOR SELECT USING (
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

-- Ensure UPDATE policy is correct (Same as previous, just to be safe)
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
