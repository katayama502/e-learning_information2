import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { requireAdmin, AuthError } from '@/lib/firebase/verifyAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ---- ユーザー更新（表示名・ロール・有効/無効・パスワード再設定）----
export async function PATCH(req: Request, { params }: { params: Promise<{ uid: string }> }) {
  try {
    const admin = await requireAdmin(req);
    const { uid } = await params;
    const body = await req.json();

    const authUpdate: Record<string, unknown> = {};
    const docUpdate: Record<string, unknown> = {};

    if (typeof body.displayName === 'string') {
      authUpdate.displayName = body.displayName.trim();
      docUpdate.displayName = body.displayName.trim();
    }
    if (body.role === 'admin' || body.role === 'student') {
      docUpdate.role = body.role;
      await adminAuth().setCustomUserClaims(uid, { admin: body.role === 'admin' });
    }
    if (typeof body.disabled === 'boolean') {
      // 自分自身は無効化できない
      if (uid === admin.uid && body.disabled) {
        return NextResponse.json({ error: '自分自身を無効化することはできません' }, { status: 400 });
      }
      authUpdate.disabled = body.disabled;
      docUpdate.disabled = body.disabled;
    }
    if (typeof body.password === 'string' && body.password) {
      if (body.password.length < 6) {
        return NextResponse.json({ error: 'パスワードは6文字以上にしてください' }, { status: 400 });
      }
      authUpdate.password = body.password;
    }

    if (Object.keys(authUpdate).length > 0) {
      await adminAuth().updateUser(uid, authUpdate);
    }
    if (Object.keys(docUpdate).length > 0) {
      await adminDb().collection('users').doc(uid).set(docUpdate, { merge: true });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}

// ---- ユーザー削除（Auth + Firestore users/progress）----
export async function DELETE(req: Request, { params }: { params: Promise<{ uid: string }> }) {
  try {
    const admin = await requireAdmin(req);
    const { uid } = await params;
    if (uid === admin.uid) {
      return NextResponse.json({ error: '自分自身を削除することはできません' }, { status: 400 });
    }

    await adminAuth().deleteUser(uid).catch(() => {/* 既に存在しない場合は無視 */});
    await adminDb().collection('users').doc(uid).delete().catch(() => {});
    await adminDb().collection('progress').doc(uid).delete().catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}

function errorResponse(e: unknown) {
  if (e instanceof AuthError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  const code = (e as { code?: string })?.code ?? '';
  if (code === 'auth/user-not-found') {
    return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
  }
  console.error('[api/admin/users/[uid]]', e);
  return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
}
