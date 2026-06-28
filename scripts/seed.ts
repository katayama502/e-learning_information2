/* ============================================================
 *  Firebase 初期化シードスクリプト
 *  - 初期管理者アカウントを作成（環境変数で指定）
 *  - 既存の36レッスン（JOHO2_UNITS）を Firestore に投入
 *
 *  使い方:
 *    1. .env.local に以下を設定
 *       FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY
 *       ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME（初期管理者）
 *    2. npm run seed
 * ============================================================ */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { JOHO2_UNITS } from '../src/data/joho2-lessons';

// .env.local を読み込み
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

function initAdmin() {
  if (getApps().length) return;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY を .env.local に設定してください');
  }
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const displayName = process.env.ADMIN_NAME || '管理者';
  if (!email || !password) {
    console.log('⚠ ADMIN_EMAIL / ADMIN_PASSWORD が未設定のため、管理者作成はスキップします');
    return;
  }

  const auth = getAuth();
  const db = getFirestore();

  let uid: string;
  try {
    const existing = await auth.getUserByEmail(email);
    uid = existing.uid;
    await auth.updateUser(uid, { password, displayName });
    console.log(`既存ユーザーを管理者として更新: ${email}`);
  } catch {
    const created = await auth.createUser({ email, password, displayName });
    uid = created.uid;
    console.log(`管理者を新規作成: ${email}`);
  }

  await auth.setCustomUserClaims(uid, { admin: true });
  await db.collection('users').doc(uid).set({
    email,
    displayName,
    role: 'admin',
    disabled: false,
    createdAt: new Date(),
  }, { merge: true });
  console.log(`✓ 管理者の設定完了（uid=${uid}）`);
}

async function seedCurriculum() {
  const db = getFirestore();
  db.settings({ ignoreUndefinedProperties: true });

  let unitCount = 0;
  let matCount = 0;

  for (let ui = 0; ui < JOHO2_UNITS.length; ui++) {
    const unit = JOHO2_UNITS[ui];
    await db.collection('units').doc(unit.id).set({
      title: unit.title,
      order: ui + 1,
      createdAt: new Date(),
    }, { merge: true });
    unitCount++;

    for (let mi = 0; mi < unit.materials.length; mi++) {
      const m = unit.materials[mi];
      await db.collection('materials').doc(m.id).set({
        unitId: unit.id,
        title: m.title,
        slide_ref: m.slide_ref ?? null,
        starter_code: m.starter_code ?? '',
        questions: m.questions ?? [],
        order: mi + 1,
        createdAt: new Date(),
      }, { merge: true });
      matCount++;
    }
  }
  console.log(`✓ カリキュラム投入完了: ${unitCount} ユニット / ${matCount} 教材`);
}

async function main() {
  initAdmin();
  console.log('=== Firebase シード開始 ===');
  await seedAdmin();
  await seedCurriculum();
  console.log('=== 完了 ===');
  process.exit(0);
}

main().catch((e) => {
  console.error('シードに失敗しました:', e);
  process.exit(1);
});
