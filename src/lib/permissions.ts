// ============================================================
// Ehime Base - Discord-like Permission System
// ============================================================

// 全権限一覧
export const ALL_PERMISSIONS = {
  // ワークスペース管理
  'workspace.manage': 'ワークスペースの設定変更',
  'workspace.delete': 'ワークスペースの削除',

  // ロール管理
  'roles.manage': 'ロールの作成・編集・削除',

  // メンバー管理
  'members.manage': 'メンバーの招待・管理',
  'members.kick': 'メンバーのキック',
  'members.ban': 'メンバーのBAN',

  // チャンネル管理
  'channels.create': 'チャンネルの作成',
  'channels.edit': 'チャンネルの編集',
  'channels.delete': 'チャンネルの削除',
  'channels.view_all': '全チャンネルの閲覧（非公開含む）',

  // メッセージ
  'messages.send': 'メッセージの送信',
  'messages.delete_others': '他人のメッセージの削除',
  'messages.pin': 'メッセージのピン留め',
  'messages.mention_everyone': '@everyone メンション',

  // アナウンス
  'announcement.send': 'アナウンスチャンネルへの投稿',
} as const;

export type PermissionKey = keyof typeof ALL_PERMISSIONS;

// 権限カテゴリ (UI表示用)
export const PERMISSION_CATEGORIES = [
  {
    name: 'ワークスペース',
    icon: 'Settings',
    permissions: ['workspace.manage', 'workspace.delete'] as PermissionKey[],
  },
  {
    name: 'ロール',
    icon: 'Shield',
    permissions: ['roles.manage'] as PermissionKey[],
  },
  {
    name: 'メンバー',
    icon: 'Users',
    permissions: ['members.manage', 'members.kick', 'members.ban'] as PermissionKey[],
  },
  {
    name: 'チャンネル',
    icon: 'Hash',
    permissions: ['channels.create', 'channels.edit', 'channels.delete', 'channels.view_all'] as PermissionKey[],
  },
  {
    name: 'メッセージ',
    icon: 'MessageSquare',
    permissions: ['messages.send', 'messages.delete_others', 'messages.pin', 'messages.mention_everyone'] as PermissionKey[],
  },
  {
    name: 'アナウンス',
    icon: 'Megaphone',
    permissions: ['announcement.send'] as PermissionKey[],
  },
];

// ロール型
export interface WorkspaceRole {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  color: string;
  icon?: string;
  position: number;
  is_system: boolean;
  is_mentionable: boolean;
  permissions: string[];
  member_count: number;
  created_at: string;
  updated_at: string;
}

// メンバーが特定の権限を持っているかチェック
export function hasPermission(
  userRoles: WorkspaceRole[],
  permission: PermissionKey
): boolean {
  return userRoles.some(role => role.permissions.includes(permission));
}

// メンバーが管理者相当か（オーナー or WS管理者）
export function isWorkspaceAdmin(userRoles: WorkspaceRole[]): boolean {
  return userRoles.some(role => ['owner', 'ws_admin'].includes(role.slug));
}

// 最上位ロールを取得
export function getHighestRole(userRoles: WorkspaceRole[]): WorkspaceRole | null {
  if (userRoles.length === 0) return null;
  return userRoles.reduce((max, role) =>
    role.position > max.position ? role : max
  );
}

// ユーザーが対象ロールより上位か
export function isHigherRole(
  userRoles: WorkspaceRole[],
  targetRole: WorkspaceRole
): boolean {
  const highest = getHighestRole(userRoles);
  if (!highest) return false;
  return highest.position > targetRole.position;
}
