import 'server-only';

// ============================================================
//  APIルート用：リクエストの呼び出し元が管理者かを検証する
//  クライアントは Authorization: Bearer <idToken> を付与する。
//  - IDトークンを Admin SDK で検証
//  - Firestore users/{uid}.role が admin（かつ未無効化）であることを確認
// ============================================================

import { adminAuth, adminDb } from './admin';

export interface AdminContext {
  uid: string;
  email: string;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

export async function requireAdmin(req: Request): Promise<AdminContext> {
  const header = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) {
    throw new AuthError('認証トークンがありません', 401);
  }
  const token = header.slice('Bearer '.length).trim();

  let decoded;
  try {
    decoded = await adminAuth().verifyIdToken(token);
  } catch {
    throw new AuthError('認証トークンが無効です', 401);
  }

  // Firestore のロールで最終判定（カスタムクレームより確実）
  const snap = await adminDb().collection('users').doc(decoded.uid).get();
  const data = snap.data();
  if (!snap.exists || data?.role !== 'admin' || data?.disabled) {
    throw new AuthError('管理者権限がありません', 403);
  }

  return { uid: decoded.uid, email: decoded.email ?? '' };
}
