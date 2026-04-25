-- ============================================
-- Discord-like Communication System
-- ============================================

-- 1. ワークスペース（Discordの「サーバー」に相当）
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    banner_url TEXT,
    settings JSONB DEFAULT '{}',
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ワークスペースメンバー
CREATE TABLE IF NOT EXISTS workspace_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('owner', 'admin', 'moderator', 'member', 'guest')) DEFAULT 'member',
    nickname TEXT,
    is_muted BOOLEAN DEFAULT FALSE,
    notification_level TEXT CHECK (notification_level IN ('all', 'mentions', 'none')) DEFAULT 'all',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);

-- 3. チャンネルカテゴリ
CREATE TABLE IF NOT EXISTS channel_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    is_collapsed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. チャンネル
CREATE TABLE IF NOT EXISTS channels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES channel_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    topic TEXT,
    description TEXT,
    type TEXT CHECK (type IN ('text', 'announcement', 'support')) DEFAULT 'text',
    visibility TEXT CHECK (visibility IN ('public', 'private')) DEFAULT 'public',
    slow_mode_seconds INTEGER DEFAULT 0,
    position INTEGER NOT NULL DEFAULT 0,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. チャンネルメンバー（プライベートチャンネル＋未読管理）
CREATE TABLE IF NOT EXISTS channel_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    notification_level TEXT CHECK (notification_level IN ('all', 'mentions', 'none')) DEFAULT 'all',
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    can_write BOOLEAN DEFAULT TRUE,
    UNIQUE(channel_id, user_id)
);

-- 6. チャンネルメッセージ
CREATE TABLE IF NOT EXISTS channel_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
    content TEXT,
    attachment_url TEXT,
    attachment_type TEXT,
    attachment_name TEXT,
    is_pinned BOOLEAN DEFAULT FALSE,
    pinned_by UUID REFERENCES profiles(id),
    is_system BOOLEAN DEFAULT FALSE,
    reply_to_id UUID REFERENCES channel_messages(id) ON DELETE SET NULL,
    thread_id UUID,
    metadata JSONB DEFAULT '{}',
    edited_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. スレッド
CREATE TABLE IF NOT EXISTS threads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE NOT NULL,
    parent_message_id UUID REFERENCES channel_messages(id) ON DELETE CASCADE NOT NULL UNIQUE,
    message_count INTEGER DEFAULT 0,
    last_message_at TIMESTAMPTZ,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. メッセージリアクション
CREATE TABLE IF NOT EXISTS message_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID REFERENCES channel_messages(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    emoji TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

-- 9. DM会話
CREATE TABLE IF NOT EXISTS dm_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT CHECK (type IN ('direct', 'group')) DEFAULT 'direct',
    name TEXT,
    icon_url TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. DM参加者
CREATE TABLE IF NOT EXISTS dm_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES dm_conversations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    is_muted BOOLEAN DEFAULT FALSE,
    notification_level TEXT CHECK (notification_level IN ('all', 'mentions', 'none')) DEFAULT 'all',
    UNIQUE(conversation_id, user_id)
);

-- 11. DMメッセージ
CREATE TABLE IF NOT EXISTS dm_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES dm_conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
    content TEXT,
    attachment_url TEXT,
    attachment_type TEXT,
    attachment_name TEXT,
    reply_to_id UUID REFERENCES dm_messages(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    edited_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. ワークスペースBAN
CREATE TABLE IF NOT EXISTS workspace_bans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    banned_by UUID REFERENCES profiles(id),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);

-- 13. 統合通知
CREATE TABLE IF NOT EXISTS comm_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    source_type TEXT,
    source_id UUID,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
    title TEXT,
    body TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- インデックス
-- ============================================
CREATE INDEX IF NOT EXISTS idx_channel_messages_channel_id ON channel_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_messages_created_at ON channel_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_channel_messages_thread_id ON channel_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_user_id ON channel_members(user_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_last_read ON channel_members(channel_id, last_read_at);
CREATE INDEX IF NOT EXISTS idx_dm_messages_conversation_id ON dm_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_comm_notifications_user ON comm_notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_message ON message_reactions(message_id);

-- ============================================
-- Realtime有効化
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE channel_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE dm_messages;

-- ============================================
-- RLSポリシー
-- ============================================
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE comm_notifications ENABLE ROW LEVEL SECURITY;

-- ワークスペース: メンバーが閲覧可能
CREATE POLICY "workspace_member_select" ON workspaces FOR SELECT USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = workspaces.id AND workspace_members.user_id = auth.uid())
    OR created_by = auth.uid()
);
CREATE POLICY "workspace_insert" ON workspaces FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "workspace_update" ON workspaces FOR UPDATE USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = workspaces.id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin'))
);

-- ワークスペースメンバー
CREATE POLICY "wm_select" ON workspace_members FOR SELECT USING (
    EXISTS (SELECT 1 FROM workspace_members wm2 WHERE wm2.workspace_id = workspace_members.workspace_id AND wm2.user_id = auth.uid())
);
CREATE POLICY "wm_insert" ON workspace_members FOR INSERT WITH CHECK (user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM workspace_members wm2 WHERE wm2.workspace_id = workspace_members.workspace_id AND wm2.user_id = auth.uid() AND wm2.role IN ('owner', 'admin'))
);
CREATE POLICY "wm_update" ON workspace_members FOR UPDATE USING (user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM workspace_members wm2 WHERE wm2.workspace_id = workspace_members.workspace_id AND wm2.user_id = auth.uid() AND wm2.role IN ('owner', 'admin'))
);
CREATE POLICY "wm_delete" ON workspace_members FOR DELETE USING (user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM workspace_members wm2 WHERE wm2.workspace_id = workspace_members.workspace_id AND wm2.user_id = auth.uid() AND wm2.role IN ('owner', 'admin'))
);

-- チャンネルカテゴリ
CREATE POLICY "cc_select" ON channel_categories FOR SELECT USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = channel_categories.workspace_id AND workspace_members.user_id = auth.uid())
);
CREATE POLICY "cc_manage" ON channel_categories FOR ALL USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = channel_categories.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin'))
);

-- チャンネル: ワークスペースメンバーが公開チャンネルを閲覧
CREATE POLICY "ch_select" ON channels FOR SELECT USING (
    (visibility = 'public' AND EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = channels.workspace_id AND workspace_members.user_id = auth.uid()))
    OR EXISTS (SELECT 1 FROM channel_members WHERE channel_members.channel_id = channels.id AND channel_members.user_id = auth.uid())
);
CREATE POLICY "ch_manage" ON channels FOR ALL USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = channels.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin'))
);

-- チャンネルメンバー
CREATE POLICY "cm_select" ON channel_members FOR SELECT USING (
    EXISTS (SELECT 1 FROM workspace_members wm JOIN channels ch ON ch.workspace_id = wm.workspace_id WHERE ch.id = channel_members.channel_id AND wm.user_id = auth.uid())
);
CREATE POLICY "cm_self" ON channel_members FOR ALL USING (user_id = auth.uid());

-- チャンネルメッセージ: チャンネルにアクセスできるメンバーが閲覧・投稿可
CREATE POLICY "msg_select" ON channel_messages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM channels ch
        JOIN workspace_members wm ON wm.workspace_id = ch.workspace_id
        WHERE ch.id = channel_messages.channel_id AND wm.user_id = auth.uid()
        AND (ch.visibility = 'public' OR EXISTS (SELECT 1 FROM channel_members cm WHERE cm.channel_id = ch.id AND cm.user_id = auth.uid()))
    )
);
CREATE POLICY "msg_insert" ON channel_messages FOR INSERT WITH CHECK (sender_id = auth.uid());
CREATE POLICY "msg_update" ON channel_messages FOR UPDATE USING (sender_id = auth.uid());

-- スレッド
CREATE POLICY "thread_select" ON threads FOR SELECT USING (
    EXISTS (SELECT 1 FROM channels ch JOIN workspace_members wm ON wm.workspace_id = ch.workspace_id WHERE ch.id = threads.channel_id AND wm.user_id = auth.uid())
);
CREATE POLICY "thread_insert" ON threads FOR INSERT WITH CHECK (true);

-- リアクション
CREATE POLICY "reaction_select" ON message_reactions FOR SELECT USING (true);
CREATE POLICY "reaction_manage" ON message_reactions FOR ALL USING (user_id = auth.uid());

-- DM会話
CREATE POLICY "dm_select" ON dm_conversations FOR SELECT USING (
    EXISTS (SELECT 1 FROM dm_participants WHERE dm_participants.conversation_id = dm_conversations.id AND dm_participants.user_id = auth.uid())
);
CREATE POLICY "dm_insert" ON dm_conversations FOR INSERT WITH CHECK (created_by = auth.uid());

-- DM参加者
CREATE POLICY "dp_select" ON dm_participants FOR SELECT USING (
    EXISTS (SELECT 1 FROM dm_participants dp2 WHERE dp2.conversation_id = dm_participants.conversation_id AND dp2.user_id = auth.uid())
);
CREATE POLICY "dp_insert" ON dm_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "dp_update" ON dm_participants FOR UPDATE USING (user_id = auth.uid());

-- DMメッセージ
CREATE POLICY "dmsg_select" ON dm_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM dm_participants WHERE dm_participants.conversation_id = dm_messages.conversation_id AND dm_participants.user_id = auth.uid())
);
CREATE POLICY "dmsg_insert" ON dm_messages FOR INSERT WITH CHECK (sender_id = auth.uid());
CREATE POLICY "dmsg_update" ON dm_messages FOR UPDATE USING (sender_id = auth.uid());

-- BAN
CREATE POLICY "ban_select" ON workspace_bans FOR SELECT USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = workspace_bans.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin'))
);
CREATE POLICY "ban_manage" ON workspace_bans FOR ALL USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_members.workspace_id = workspace_bans.workspace_id AND workspace_members.user_id = auth.uid() AND workspace_members.role IN ('owner', 'admin'))
);

-- 通知
CREATE POLICY "notif_select" ON comm_notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notif_insert" ON comm_notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notif_update" ON comm_notifications FOR UPDATE USING (user_id = auth.uid());
