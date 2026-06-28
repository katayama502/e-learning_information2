import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { requireAdmin, AuthError } from '@/lib/firebase/verifyAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ---- ユーザー一覧 ----
export async function GET(req: Request) {
  try {
    await requireAdmin(req);
    const snap = await adminDb().collection('users').orderBy('createdAt', 'desc').get();
    const users = snap.docs.map((d) => {
      const u = d.data();
      return {
        uid: d.id,
        email: u.email ?? '',
        displayName: u.displayName ?? '',
        role: u.role ?? 'student',
        disabled: Boolean(u.disabled),
        createdAt: u.createdAt?.toDate?.()?.toISOString?.() ?? null,
      };
    });
    return NextResponse.json({ users });
  } catch (e) {
    return errorResponse(e);
  }
}

// ---- ユーザー作成 ----
export async function POST(req: Request) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    const email = String(body.email ?? '').trim();
    const password = String(body.password ?? '');
    const displayName = String(body.displayName ?? '').trim();
    const role = body.role === 'admin' ? 'admin' : 'student';

    if (!email || !password) {
      return NextResponse.json({ error: 'メールアドレスとパスワードは必須です' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'パスワードは6文字以上にしてください' }, { status: 400 });
    }

    const userRecord = await adminAuth().createUser({
      email,
      password,
      displayName: displayName || undefined,
    });

    // 管理者ロールはカスタムクレームにも反映（Firestoreルールで利用）
    await adminAuth().setCustomUserClaims(userRecord.uid, { admin: role === 'admin' });

    await adminDb().collection('users').doc(userRecord.uid).set({
      email,
      displayName,
      role,
      disabled: false,
      createdAt: new Date(),
    });

    return NextResponse.json({
      uid: userRecord.uid,
      email,
      displayName,
      role,
      disabled: false,
    });
  } catch (e) {
    return errorResponse(e);
  }
}

function errorResponse(e: unknown) {
  if (e instanceof AuthError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  const code = (e as { code?: string })?.code ?? '';
  if (code === 'auth/email-already-exists') {
    return NextResponse.json({ error: 'このメールアドレスは既に使われています' }, { status: 409 });
  }
  if (code === 'auth/invalid-email') {
    return NextResponse.json({ error: 'メールアドレスの形式が正しくありません' }, { status: 400 });
  }
  console.error('[api/admin/users]', e);
  return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
}
