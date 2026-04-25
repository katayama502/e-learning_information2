import { create } from 'zustand';
import { createClient } from '@/utils/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

// --- Types ---

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  organization_id?: string;
  member_count?: number;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: string;
  nickname?: string;
  is_muted: boolean;
  profile?: {
    full_name: string;
    avatar_url: string;
    email: string;
  };
}

export interface ChannelCategory {
  id: string;
  workspace_id: string;
  name: string;
  position: number;
}

export interface Channel {
  id: string;
  workspace_id: string;
  category_id?: string;
  name: string;
  topic?: string;
  type: 'text' | 'announcement' | 'support';
  visibility: 'public' | 'private';
  position: number;
  is_archived: boolean;
  unread_count?: number;
}

export interface ChannelMessage {
  id: string;
  channel_id: string;
  sender_id: string;
  content?: string;
  attachment_url?: string;
  attachment_type?: string;
  attachment_name?: string;
  is_pinned: boolean;
  is_system: boolean;
  reply_to_id?: string;
  reply_to?: {
    content: string;
    sender_name: string;
  };
  thread_id?: string;
  metadata: any;
  edited_at?: string;
  deleted_at?: string;
  created_at: string;
  sender?: {
    full_name: string;
    avatar_url: string;
  };
  reactions?: {
    emoji: string;
    count: number;
    users: string[];
  }[];
}

export interface DMConversation {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  participants: {
    user_id: string;
    full_name: string;
    avatar_url: string;
  }[];
  last_message?: {
    content: string;
    created_at: string;
    sender_name: string;
  };
  unread_count?: number;
  updated_at: string;
}

export interface DMMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content?: string;
  attachment_url?: string;
  reply_to_id?: string;
  metadata: any;
  created_at: string;
  sender?: {
    full_name: string;
    avatar_url: string;
  };
}

// --- Store State & Actions ---

interface CommunicationState {
  // State
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  channels: Channel[];
  categories: ChannelCategory[];
  members: WorkspaceMember[];
  activeChannelId: string | null;
  channelMessages: Record<string, ChannelMessage[]>;
  dmConversations: DMConversation[];
  activeDmId: string | null;
  dmMessages: Record<string, DMMessage[]>;
  typingUsers: Record<string, string[]>;
  onlineUsers: string[];
  isLoading: boolean;

  // Internal refs (not serialized)
  _channelSubscription: RealtimeChannel | null;
  _dmSubscription: RealtimeChannel | null;
  _typingSubscription: RealtimeChannel | null;

  // Actions - Workspaces
  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (name: string, description?: string, icon_url?: string) => Promise<Workspace | null>;
  setActiveWorkspace: (id: string) => Promise<void>;
  fetchWorkspaceDetails: (workspaceId: string) => Promise<void>;
  joinWorkspace: (workspaceId: string) => Promise<boolean>;

  // Actions - Channels
  setActiveChannel: (channelId: string) => Promise<void>;
  fetchChannelMessages: (channelId: string, before?: string) => Promise<void>;
  sendChannelMessage: (
    channelId: string,
    content: string,
    attachment?: { url: string; type: string; name: string },
    replyToId?: string
  ) => Promise<void>;
  createChannel: (
    workspaceId: string,
    name: string,
    type: 'text' | 'announcement' | 'support',
    categoryId?: string,
    visibility?: 'public' | 'private'
  ) => Promise<Channel | null>;

  // Actions - DMs
  fetchDMConversations: () => Promise<void>;
  createDM: (participantIds: string[]) => Promise<DMConversation | null>;
  setActiveDM: (dmId: string) => Promise<void>;
  fetchDMMessages: (dmId: string, before?: string) => Promise<void>;
  sendDMMessage: (
    dmId: string,
    content: string,
    attachment?: { url: string; type: string; name: string },
    replyToId?: string
  ) => Promise<void>;

  // Actions - Realtime
  subscribeToChannel: (channelId: string) => void;
  unsubscribeFromChannel: () => void;
  subscribeToDMs: () => void;
  unsubscribeFromDMs: () => void;
  sendTypingIndicator: (channelId: string, userId: string) => void;

  // Actions - Message operations
  editChannelMessage: (channelId: string, messageId: string, content: string) => Promise<void>;
  deleteChannelMessage: (channelId: string, messageId: string) => Promise<void>;
  pinChannelMessage: (channelId: string, messageId: string, pinned: boolean) => Promise<void>;
  toggleReaction: (messageId: string, emoji: string, channelId: string) => Promise<void>;
  updateMessageReactions: (channelId: string, messageId: string, reactions: { emoji: string; count: number; users: string[] }[]) => void;
}

export const useCommunicationStore = create<CommunicationState>((set, get) => ({
  // --- Initial State ---
  workspaces: [],
  activeWorkspaceId: null,
  channels: [],
  categories: [],
  members: [],
  activeChannelId: null,
  channelMessages: {},
  dmConversations: [],
  activeDmId: null,
  dmMessages: {},
  typingUsers: {},
  onlineUsers: [],
  isLoading: false,

  _channelSubscription: null,
  _dmSubscription: null,
  _typingSubscription: null,

  // --- Workspace Actions ---

  fetchWorkspaces: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/communication/workspaces');
      if (!res.ok) throw new Error('Failed to fetch workspaces');
      const data = await res.json();
      set({ workspaces: data.data ?? data.workspaces ?? data ?? [] });
    } catch (error) {
      console.error('fetchWorkspaces error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  createWorkspace: async (name: string, description?: string, icon_url?: string) => {
    try {
      const res = await fetch('/api/communication/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, icon_url }),
      });
      if (!res.ok) throw new Error('Failed to create workspace');
      const workspace: Workspace = await res.json();
      set((state) => ({ workspaces: [...state.workspaces, workspace] }));
      return workspace;
    } catch (error) {
      console.error('createWorkspace error:', error);
      return null;
    }
  },

  setActiveWorkspace: async (id: string) => {
    set({ activeWorkspaceId: id, activeChannelId: null, channels: [], categories: [], members: [] });
    await get().fetchWorkspaceDetails(id);
  },

  fetchWorkspaceDetails: async (workspaceId: string) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/communication/workspaces/${workspaceId}`);
      if (!res.ok) throw new Error('Failed to fetch workspace details');
      const json = await res.json();
      const data = json.data ?? json;
      set({
        channels: data.channels ?? [],
        categories: data.categories ?? [],
        members: data.members ?? [],
      });
    } catch (error) {
      console.error('fetchWorkspaceDetails error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  joinWorkspace: async (workspaceId: string) => {
    try {
      const res = await fetch(`/api/communication/workspaces/${workspaceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join' }),
      });
      if (!res.ok) throw new Error('Failed to join workspace');
      await get().fetchWorkspaces();
      return true;
    } catch (error) {
      console.error('joinWorkspace error:', error);
      return false;
    }
  },

  // --- Channel Actions ---

  setActiveChannel: async (channelId: string) => {
    const prev = get().activeChannelId;
    if (prev) {
      get().unsubscribeFromChannel();
    }
    set({ activeChannelId: channelId });
    await get().fetchChannelMessages(channelId);
    get().subscribeToChannel(channelId);

    // Update last read (fire-and-forget)
    fetch(`/api/communication/channels/${channelId}/read`, { method: 'POST' }).catch(() => {});
  },

  fetchChannelMessages: async (channelId: string, before?: string) => {
    try {
      const url = new URL(`/api/communication/channels/${channelId}/messages`, window.location.origin);
      if (before) url.searchParams.set('before', before);

      const res = await fetch(url.toString());
      if (!res.ok) {
        console.warn(`fetchChannelMessages: ${res.status} for channel ${channelId}`);
        return;
      }
      const data = await res.json();
      const messages: ChannelMessage[] = data.data ?? data.messages ?? data ?? [];

      set((state) => {
        const existing = before ? (state.channelMessages[channelId] ?? []) : [];
        return {
          channelMessages: {
            ...state.channelMessages,
            [channelId]: before ? [...messages, ...existing] : messages,
          },
        };
      });
    } catch (error) {
      console.error('fetchChannelMessages error:', error);
    }
  },

  sendChannelMessage: async (channelId, content, attachment, replyToId) => {
    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    // プロフィールから名前を取得（user_metadataにない場合があるため）
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single();

    const senderName = profile?.full_name || user.user_metadata?.full_name || 'You';
    const senderAvatar = profile?.avatar_url || user.user_metadata?.avatar_url || '';

    const optimisticMsg: ChannelMessage = {
      id: tempId,
      channel_id: channelId,
      sender_id: user.id,
      content,
      attachment_url: attachment?.url,
      attachment_type: attachment?.type,
      attachment_name: attachment?.name,
      is_pinned: false,
      is_system: false,
      reply_to_id: replyToId,
      metadata: {},
      created_at: new Date().toISOString(),
      sender: {
        full_name: senderName,
        avatar_url: senderAvatar,
      },
    };

    set((state) => ({
      channelMessages: {
        ...state.channelMessages,
        [channelId]: [...(state.channelMessages[channelId] ?? []), optimisticMsg],
      },
    }));

    try {
      const res = await fetch(`/api/communication/channels/${channelId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          attachment_url: attachment?.url,
          attachment_type: attachment?.type,
          attachment_name: attachment?.name,
          reply_to_id: replyToId,
        }),
      });

      if (!res.ok) throw new Error('Failed to send message');
      const json = await res.json();
      const serverMsg: ChannelMessage = json.data ?? json;

      // Replace optimistic message with server response
      set((state) => {
        const existing = state.channelMessages[channelId] ?? [];
        const hasTempMsg = existing.some((m) => m.id === tempId);
        const hasRealMsg = existing.some((m) => m.id === serverMsg.id);

        if (hasTempMsg && !hasRealMsg) {
          // Normal: replace temp with real
          return {
            channelMessages: {
              ...state.channelMessages,
              [channelId]: existing.map((m) => m.id === tempId ? serverMsg : m),
            },
          };
        } else if (hasTempMsg && hasRealMsg) {
          // Realtime already added the real msg, just remove temp
          return {
            channelMessages: {
              ...state.channelMessages,
              [channelId]: existing.filter((m) => m.id !== tempId),
            },
          };
        } else {
          // Temp was already replaced by realtime handler
          return state;
        }
      });
    } catch (error) {
      console.error('sendChannelMessage error:', error);
      // Remove optimistic message on failure
      set((state) => ({
        channelMessages: {
          ...state.channelMessages,
          [channelId]: (state.channelMessages[channelId] ?? []).filter((m) => m.id !== tempId),
        },
      }));
    }
  },

  createChannel: async (workspaceId, name, type, categoryId, visibility) => {
    try {
      const res = await fetch(`/api/communication/workspaces/${workspaceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_channel',
          name,
          type,
          category_id: categoryId,
          visibility: visibility ?? 'public',
        }),
      });
      if (!res.ok) throw new Error('Failed to create channel');
      const channel: Channel = await res.json();
      set((state) => ({ channels: [...state.channels, channel] }));
      return channel;
    } catch (error) {
      console.error('createChannel error:', error);
      return null;
    }
  },

  // --- DM Actions ---

  fetchDMConversations: async () => {
    try {
      const res = await fetch('/api/communication/dm');
      if (!res.ok) {
        console.warn('DM conversations fetch failed with status:', res.status);
        set({ dmConversations: [] });
        return;
      }
      const data = await res.json();
      set({ dmConversations: data.data ?? data.conversations ?? data ?? [] });
    } catch (error) {
      console.warn('fetchDMConversations error (non-critical):', error);
      set({ dmConversations: [] });
    }
  },

  createDM: async (participantIds: string[]) => {
    try {
      const res = await fetch('/api/communication/dm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participant_ids: participantIds }),
      });
      if (!res.ok) throw new Error('Failed to create DM');
      const conversation: DMConversation = await res.json();
      set((state) => ({
        dmConversations: [conversation, ...state.dmConversations.filter((c) => c.id !== conversation.id)],
      }));
      return conversation;
    } catch (error) {
      console.error('createDM error:', error);
      return null;
    }
  },

  setActiveDM: async (dmId: string) => {
    set({ activeDmId: dmId });
    await get().fetchDMMessages(dmId);
  },

  fetchDMMessages: async (dmId: string, before?: string) => {
    try {
      const url = new URL(`/api/communication/dm/${dmId}/messages`, window.location.origin);
      if (before) url.searchParams.set('before', before);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch DM messages');
      const data = await res.json();
      const messages: DMMessage[] = data.data ?? data.messages ?? data ?? [];

      set((state) => {
        const existing = before ? (state.dmMessages[dmId] ?? []) : [];
        return {
          dmMessages: {
            ...state.dmMessages,
            [dmId]: before ? [...messages, ...existing] : messages,
          },
        };
      });
    } catch (error) {
      console.error('fetchDMMessages error:', error);
    }
  },

  sendDMMessage: async (dmId, content, attachment, replyToId) => {
    const tempId = `temp-${Date.now()}`;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const optimisticMsg: DMMessage = {
      id: tempId,
      conversation_id: dmId,
      sender_id: user.id,
      content,
      attachment_url: attachment?.url,
      reply_to_id: replyToId,
      metadata: {},
      created_at: new Date().toISOString(),
      sender: {
        full_name: user.user_metadata?.full_name ?? 'You',
        avatar_url: user.user_metadata?.avatar_url ?? '',
      },
    };

    set((state) => ({
      dmMessages: {
        ...state.dmMessages,
        [dmId]: [...(state.dmMessages[dmId] ?? []), optimisticMsg],
      },
    }));

    try {
      const res = await fetch(`/api/communication/dm/${dmId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          attachment_url: attachment?.url,
          reply_to_id: replyToId,
        }),
      });

      if (!res.ok) throw new Error('Failed to send DM');
      const serverMsg: DMMessage = await res.json();

      set((state) => ({
        dmMessages: {
          ...state.dmMessages,
          [dmId]: (state.dmMessages[dmId] ?? []).map((m) =>
            m.id === tempId ? serverMsg : m
          ),
        },
      }));
    } catch (error) {
      console.error('sendDMMessage error:', error);
      set((state) => ({
        dmMessages: {
          ...state.dmMessages,
          [dmId]: (state.dmMessages[dmId] ?? []).filter((m) => m.id !== tempId),
        },
      }));
    }
  },

  // --- Realtime Subscriptions ---

  subscribeToChannel: (channelId: string) => {
    const supabase = createClient();

    // Channel messages subscription
    const channelSub = supabase
      .channel(`channel:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'channel_messages',
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload: any) => {
          const newMsg = payload.new as ChannelMessage;

          // リアルタイムにはsender情報がないのでprofileを取得
          if (!newMsg.sender) {
            const { data: senderProfile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', newMsg.sender_id)
              .single();
            newMsg.sender = senderProfile || { full_name: '不明', avatar_url: '' };
          }

          set((state) => {
            const existing = state.channelMessages[channelId] ?? [];
            if (existing.some((m) => m.id === newMsg.id)) return state;
            const hasTempVersion = existing.some((m) =>
              m.id.startsWith('temp-') &&
              m.sender_id === newMsg.sender_id &&
              m.content === newMsg.content
            );
            if (hasTempVersion) {
              return {
                channelMessages: {
                  ...state.channelMessages,
                  [channelId]: existing.map((m) =>
                    m.id.startsWith('temp-') &&
                    m.sender_id === newMsg.sender_id &&
                    m.content === newMsg.content
                      ? newMsg
                      : m
                  ),
                },
              };
            }
            return {
              channelMessages: {
                ...state.channelMessages,
                [channelId]: [...existing, newMsg],
              },
            };
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'channel_messages',
          filter: `channel_id=eq.${channelId}`,
        },
        (payload: any) => {
          const updated = payload.new as ChannelMessage;
          set((state) => ({
            channelMessages: {
              ...state.channelMessages,
              [channelId]: (state.channelMessages[channelId] ?? []).map((m) =>
                m.id === updated.id ? { ...m, ...updated } : m
              ),
            },
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'channel_messages',
          filter: `channel_id=eq.${channelId}`,
        },
        (payload: any) => {
          const deletedId = (payload.old as any).id;
          set((state) => ({
            channelMessages: {
              ...state.channelMessages,
              [channelId]: (state.channelMessages[channelId] ?? []).filter(
                (m) => m.id !== deletedId
              ),
            },
          }));
        }
      )
      .subscribe();

    // Typing indicators subscription
    const typingSub = supabase
      .channel(`typing:${channelId}`)
      .on('broadcast', { event: 'typing' }, ({ payload }: { payload: any }) => {
        const userId = payload.userId as string;
        set((state) => {
          const current = state.typingUsers[channelId] ?? [];
          if (current.includes(userId)) return state;
          return {
            typingUsers: {
              ...state.typingUsers,
              [channelId]: [...current, userId],
            },
          };
        });

        // Remove typing indicator after 3 seconds
        setTimeout(() => {
          set((state) => ({
            typingUsers: {
              ...state.typingUsers,
              [channelId]: (state.typingUsers[channelId] ?? []).filter(
                (id) => id !== userId
              ),
            },
          }));
        }, 3000);
      })
      .subscribe();

    set({ _channelSubscription: channelSub, _typingSubscription: typingSub });
  },

  unsubscribeFromChannel: () => {
    const { _channelSubscription, _typingSubscription } = get();
    if (_channelSubscription) {
      const supabase = createClient();
      supabase.removeChannel(_channelSubscription);
    }
    if (_typingSubscription) {
      const supabase = createClient();
      supabase.removeChannel(_typingSubscription);
    }
    set({ _channelSubscription: null, _typingSubscription: null });
  },

  subscribeToDMs: () => {
    const supabase = createClient();

    const dmSub = supabase
      .channel('dm:all')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dm_messages',
        },
        (payload: any) => {
          const newMsg = payload.new as DMMessage;
          const dmId = newMsg.conversation_id;
          set((state) => {
            const existing = state.dmMessages[dmId] ?? [];
            if (existing.some((m) => m.id === newMsg.id)) return state;
            return {
              dmMessages: {
                ...state.dmMessages,
                [dmId]: [...existing, newMsg],
              },
            };
          });
          // Also refresh conversations to update last_message
          get().fetchDMConversations();
        }
      )
      .subscribe();

    set({ _dmSubscription: dmSub });
  },

  unsubscribeFromDMs: () => {
    const { _dmSubscription } = get();
    if (_dmSubscription) {
      const supabase = createClient();
      supabase.removeChannel(_dmSubscription);
    }
    set({ _dmSubscription: null });
  },

  sendTypingIndicator: (channelId: string, userId: string) => {
    const supabase = createClient();
    supabase.channel(`typing:${channelId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId },
    });
  },

  // --- Message operations ---

  editChannelMessage: async (channelId, messageId, content) => {
    try {
      const res = await fetch(`/api/communication/channels/${channelId}/messages`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: messageId, content }),
      });
      if (!res.ok) throw new Error('Failed to edit message');
      // Update locally
      set((state) => ({
        channelMessages: {
          ...state.channelMessages,
          [channelId]: (state.channelMessages[channelId] ?? []).map((m) =>
            m.id === messageId ? { ...m, content, edited_at: new Date().toISOString() } : m
          ),
        },
      }));
    } catch (error) {
      console.error('editChannelMessage error:', error);
    }
  },

  deleteChannelMessage: async (channelId, messageId) => {
    try {
      const res = await fetch(`/api/communication/channels/${channelId}/messages`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: messageId }),
      });
      if (!res.ok) throw new Error('Failed to delete message');
      // Remove locally
      set((state) => ({
        channelMessages: {
          ...state.channelMessages,
          [channelId]: (state.channelMessages[channelId] ?? []).filter((m) => m.id !== messageId),
        },
      }));
    } catch (error) {
      console.error('deleteChannelMessage error:', error);
    }
  },

  pinChannelMessage: async (channelId, messageId, pinned) => {
    try {
      const res = await fetch(`/api/communication/channels/${channelId}/messages`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: messageId, is_pinned: pinned }),
      });
      if (!res.ok) throw new Error('Failed to pin message');
      set((state) => ({
        channelMessages: {
          ...state.channelMessages,
          [channelId]: (state.channelMessages[channelId] ?? []).map((m) =>
            m.id === messageId ? { ...m, is_pinned: pinned } : m
          ),
        },
      }));
    } catch (error) {
      console.error('pinChannelMessage error:', error);
    }
  },

  // --- Reactions ---

  toggleReaction: async (messageId: string, emoji: string, channelId: string) => {
    try {
      const res = await fetch(`/api/communication/channels/${channelId}/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });
      if (!res.ok) throw new Error('Failed to toggle reaction');

      // Refresh messages to get updated reactions
      await get().fetchChannelMessages(channelId);
    } catch (error) {
      console.error('toggleReaction error:', error);
    }
  },

  updateMessageReactions: (channelId, messageId, reactions) => {
    set((state) => {
      const msgs = state.channelMessages[channelId] ?? [];
      return {
        channelMessages: {
          ...state.channelMessages,
          [channelId]: msgs.map(m =>
            m.id === messageId ? { ...m, reactions } : m
          ),
        },
      };
    });
  },
}));
