/**
 * LINE Messaging API クライアント。
 * @line/bot-sdk を入れずに fetch ベースで実装（依存最小化）。
 *
 * 2 つのチャネルを使い分ける:
 *   - 'baito':    EISバイト LINE（登録者個別配信、出発確認受付）
 *   - 'official': EIS公式 LINE（一斉配信、新規誘導）
 */

import crypto from 'crypto';

export type LineChannel = 'baito' | 'official';

interface LineCredentials {
  channelSecret: string;
  channelAccessToken: string;
}

function getCredentials(channel: LineChannel): LineCredentials {
  if (channel === 'baito') {
    return {
      channelSecret: process.env.LINE_BAITO_CHANNEL_SECRET ?? '',
      channelAccessToken: process.env.LINE_BAITO_CHANNEL_ACCESS_TOKEN ?? '',
    };
  }
  return {
    channelSecret: process.env.LINE_OFFICIAL_CHANNEL_SECRET ?? '',
    channelAccessToken: process.env.LINE_OFFICIAL_CHANNEL_ACCESS_TOKEN ?? '',
  };
}

/**
 * Webhook 署名検証 (HMAC-SHA256)。
 * LINE の x-line-signature ヘッダと、生 body から計算したものを比較。
 */
export function verifyLineSignature(
  channel: LineChannel,
  rawBody: string,
  signature: string | null
): boolean {
  if (!signature) return false;
  const { channelSecret } = getCredentials(channel);
  if (!channelSecret) return false;

  const expected = crypto
    .createHmac('sha256', channelSecret)
    .update(rawBody)
    .digest('base64');

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export interface LineTextMessage {
  type: 'text';
  text: string;
}

export interface LineImageMessage {
  type: 'image';
  originalContentUrl: string;
  previewImageUrl: string;
}

export type LineMessage = LineTextMessage | LineImageMessage;

interface LineApiResponse {
  success: boolean;
  status: number;
  body?: unknown;
  error?: string;
}

/**
 * Reply API: webhook の reply_token を使って即時返信（無料）。
 */
export async function replyMessage(
  channel: LineChannel,
  replyToken: string,
  messages: LineMessage[]
): Promise<LineApiResponse> {
  const { channelAccessToken } = getCredentials(channel);
  if (!channelAccessToken) {
    return { success: false, status: 0, error: 'LINE channel access token not configured' };
  }
  return callLineApi('https://api.line.me/v2/bot/message/reply', channelAccessToken, {
    replyToken,
    messages,
  });
}

/**
 * Push API: 任意の userId にメッセージを送る。
 */
export async function pushMessage(
  channel: LineChannel,
  to: string,
  messages: LineMessage[]
): Promise<LineApiResponse> {
  const { channelAccessToken } = getCredentials(channel);
  if (!channelAccessToken) {
    return { success: false, status: 0, error: 'LINE channel access token not configured' };
  }
  return callLineApi('https://api.line.me/v2/bot/message/push', channelAccessToken, {
    to,
    messages,
  });
}

/**
 * Multicast API: 複数 userId に同じメッセージを送る（最大 500 件）。
 */
export async function multicastMessage(
  channel: LineChannel,
  to: string[],
  messages: LineMessage[]
): Promise<LineApiResponse> {
  const { channelAccessToken } = getCredentials(channel);
  if (!channelAccessToken) {
    return { success: false, status: 0, error: 'LINE channel access token not configured' };
  }
  return callLineApi('https://api.line.me/v2/bot/message/multicast', channelAccessToken, {
    to,
    messages,
  });
}

/**
 * Broadcast API: 友だち全員に一斉配信。EIS公式 LINE の募集告知に使う。
 */
export async function broadcastMessage(
  channel: LineChannel,
  messages: LineMessage[]
): Promise<LineApiResponse> {
  const { channelAccessToken } = getCredentials(channel);
  if (!channelAccessToken) {
    return { success: false, status: 0, error: 'LINE channel access token not configured' };
  }
  return callLineApi('https://api.line.me/v2/bot/message/broadcast', channelAccessToken, {
    messages,
  });
}

export interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  language?: string;
}

/**
 * ユーザープロフィール取得（友だち追加された相手のみ）。
 */
export async function getProfile(channel: LineChannel, userId: string): Promise<LineProfile | null> {
  const { channelAccessToken } = getCredentials(channel);
  if (!channelAccessToken) return null;
  try {
    const res = await fetch(`https://api.line.me/v2/bot/profile/${encodeURIComponent(userId)}`, {
      headers: { Authorization: `Bearer ${channelAccessToken}` },
    });
    if (!res.ok) return null;
    return (await res.json()) as LineProfile;
  } catch {
    return null;
  }
}

async function callLineApi(
  url: string,
  accessToken: string,
  payload: unknown
): Promise<LineApiResponse> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    let body: unknown = text;
    try { body = text ? JSON.parse(text) : null; } catch {}
    return {
      success: res.ok,
      status: res.status,
      body,
      error: res.ok ? undefined : `LINE API ${res.status}: ${text.slice(0, 200)}`,
    };
  } catch (err: unknown) {
    return {
      success: false,
      status: 0,
      error: err instanceof Error ? err.message : 'unknown error',
    };
  }
}

/**
 * 紐付けトークン: 6 文字の英数字（大文字）。LINE で送ってもらう。
 */
export function generateLineLinkToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // I, O, 0, 1 を除外（読み間違い防止）
  let token = '';
  for (let i = 0; i < 6; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}
