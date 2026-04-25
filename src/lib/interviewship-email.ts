import { resend } from './resend';
import { sendGmailEmail } from './gmail';
import { createAdminClient } from '@/utils/supabase/admin';

// === 一斉送信者の設定 ===
export type InterviewshipSenderKey = 'nishimura' | 'fukuoka' | 'horiuchi' | 'system';

export const INTERVIEWSHIP_SENDERS: Record<InterviewshipSenderKey, { email: string; name: string }> = {
    nishimura: { email: 'y.nishimura@eis-reach.com', name: '西村 友祐' },
    fukuoka: { email: 'fukuoka41@nagahamakisetsu.com', name: '福岡 信一' },
    horiuchi: { email: 'akirahori1204@gmail.com', name: '堀内 章' },
    system: { email: 'noreply@eis-reach.com', name: 'インタビューシップ運営事務局' },
};

export interface BroadcastRecipient {
    email: string;
    name?: string;
    organizationId?: string;
}

export interface BroadcastResult {
    total: number;
    sent: number;
    failed: number;
    skipped: number;
    errors: Array<{ email: string; error: string }>;
}

export interface SendAccountEmailParams {
  email: string;
  contactName?: string;
  companyName?: string;
  password: string;
  companyId?: string;
  organizationId?: string;
  programId?: string;
  emailType?: 'account_invite' | 'password_reset' | 'bulk_resend' | 'reminder' | 'manual';
  sentBy?: string;
}

export interface SendResult {
  email: string;
  success: boolean;
  error?: string;
  logId?: string;
}

/**
 * 汎用メール送信（1件）。bulk resend / reminder / welcome 等の共通入り口。
 * - Gmail SMTP 経由で送信し、送信履歴を interviewship_email_send_logs に記録する
 * - senderKey で From 表示名と Reply-To を切り替える（西村/福岡/堀内/運営共通）
 */
export async function sendInterviewshipEmail(
  toEmail: string,
  subject: string,
  html: string,
  senderKey: InterviewshipSenderKey,
  options?: {
    sentBy?: string | null;
    programId?: string | null;
    organizationId?: string | null;
  },
): Promise<SendResult> {
  const sender = INTERVIEWSHIP_SENDERS[senderKey];
  const supabase = createAdminClient();

  const sendResult = await sendGmailEmail({
    to: toEmail,
    subject,
    html,
    fromDisplayName: `愛媛県中小企業家同友会 インタビューシップ運営事務局（${sender.name}）`,
    replyTo: sender.email,
  });

  const status = sendResult.success ? 'sent' : 'failed';
  const { data: logRow } = await supabase
    .from('interviewship_email_send_logs')
    .insert({
      sent_by: options?.sentBy ?? null,
      sender_key: senderKey,
      from_email: sender.email,
      to_email: toEmail,
      subject,
      body_html: html,
      status,
      error: sendResult.error ?? null,
      program_id: options?.programId ?? null,
      organization_id: options?.organizationId ?? null,
    })
    .select('id')
    .single();

  if (!sendResult.success) {
    return { email: toEmail, success: false, error: sendResult.error, logId: logRow?.id };
  }
  return { email: toEmail, success: true, logId: logRow?.id };
}

/**
 * 新規登録企業向けのウェルカム（ログイン情報案内）メール本文を組み立てる。
 * 戻り値の html はそのまま Resend に渡せる HTML。
 */
export function buildWelcomeEmailHtml(params: {
  companyName: string;
  contactName?: string;
  loginEmail: string;
  temporaryPassword: string;
  loginUrl: string;
  programName?: string;
}): { subject: string; html: string } {
  const greeting = params.contactName ? `${params.contactName} 様` : 'ご担当者様';
  const programLine = params.programName
    ? `<p>この度は<strong>${params.programName}</strong>にお申し込みいただき、誠にありがとうございます。</p>`
    : '';

  const subject = `【ご登録完了】${params.companyName} 様 インタビューシップ企業アカウントのご案内`;
  const html = `
<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:640px;margin:0 auto;color:#1f2937;line-height:1.8;">
  <p>${greeting}</p>
  ${programLine}
  <p>企業ご担当者様向けの管理画面ログイン情報を発行いたしましたのでご案内いたします。</p>
  <div style="background:#f1f5f9;border-radius:12px;padding:20px 24px;margin:24px 0;">
    <div style="font-size:11px;font-weight:700;color:#64748b;letter-spacing:0.05em;">ログインURL</div>
    <div><a href="${params.loginUrl}" style="color:#2563eb;font-weight:700;text-decoration:none;">${params.loginUrl}</a></div>
    <div style="font-size:11px;font-weight:700;color:#64748b;letter-spacing:0.05em;margin-top:12px;">メールアドレス</div>
    <div>${params.loginEmail}</div>
    <div style="font-size:11px;font-weight:700;color:#64748b;letter-spacing:0.05em;margin-top:12px;">初期パスワード</div>
    <div style="font-family:monospace;background:#fff;border:1px solid #cbd5e1;border-radius:6px;padding:6px 10px;display:inline-block;">${params.temporaryPassword}</div>
  </div>
  <p style="font-size:13px;color:#64748b;">※ 初回ログイン後、マイページよりパスワードの変更をお願いいたします。</p>
  <p style="margin-top:24px;">ご不明な点がございましたら、本メールにご返信ください。</p>
  <p style="margin-top:32px;">インタビューシップ運営事務局（合同会社EIS）</p>
</div>
`;
  return { subject, html };
}

/**
 * 参加企業宛の案内メール一斉送信（Gmail SMTP 経由）。
 * - 配信停止（interviewship_email_unsubscribes）に登録のあるアドレスはスキップ
 * - `{{name}}` を受信者名に置換
 * - 送信履歴を interviewship_email_send_logs に記録
 * - SMTP のレート過多を避けるため、1件ごとに小さな待機を入れる
 */
export async function sendInterviewshipBroadcast(
  recipients: BroadcastRecipient[],
  subject: string,
  bodyHtml: string,
  options: {
    sentBy: string;
    senderKey: InterviewshipSenderKey;
    programId?: string | null;
  },
): Promise<BroadcastResult> {
  const sender = INTERVIEWSHIP_SENDERS[options.senderKey];
  const fromDisplayName = `愛媛県中小企業家同友会 インタビューシップ運営事務局（${sender.name}）`;
  const supabase = createAdminClient();
  const result: BroadcastResult = {
    total: recipients.length,
    sent: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  // 配信停止リストを取得
  const { data: unsubRows } = await supabase
    .from('interviewship_email_unsubscribes')
    .select('email');
  const unsubSet = new Set((unsubRows ?? []).map((u: { email: string }) => u.email.toLowerCase()));

  const unsubscribeBase = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ehime-base-app.vercel.app';

  for (const recipient of recipients) {
    if (!recipient.email) {
      result.failed++;
      result.errors.push({ email: recipient.email ?? '', error: 'email not set' });
      continue;
    }
    if (unsubSet.has(recipient.email.toLowerCase())) {
      result.skipped++;
      continue;
    }

    const name = recipient.name && recipient.name.trim() ? recipient.name : 'ご担当者';
    const replacedSubject = subject.replace(/\{\{name\}\}/g, name);
    const replacedBody = bodyHtml.replace(/\{\{name\}\}/g, name);

    const unsubUrl = `${unsubscribeBase}/interviewship/unsubscribe?email=${encodeURIComponent(recipient.email)}`;
    const htmlWithFooter = `${replacedBody}
<br><br>
<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
<p style="font-size:11px;color:#94a3b8;line-height:1.6;">
このメールは愛媛県中小企業家同友会インタビューシップ運営事務局（合同会社EIS）から送信しています。<br>
今後のご案内を希望されない場合は<a href="${unsubUrl}" style="color:#64748b;">こちら</a>から配信停止できます。
</p>`;

    const sendRes = await sendGmailEmail({
      to: recipient.email,
      subject: replacedSubject,
      html: htmlWithFooter,
      fromDisplayName,
      replyTo: sender.email,
    });

    const status = sendRes.success ? 'sent' : 'failed';
    const errorMessage = sendRes.error ?? null;

    if (!sendRes.success) {
      result.failed++;
      result.errors.push({ email: recipient.email, error: errorMessage ?? 'unknown error' });
    } else {
      result.sent++;
    }

    await supabase.from('interviewship_email_send_logs').insert({
      sent_by: options.sentBy,
      sender_key: options.senderKey,
      from_email: sender.email,
      to_email: recipient.email,
      subject: replacedSubject,
      body_html: htmlWithFooter,
      status,
      error: errorMessage,
      program_id: options.programId ?? null,
      organization_id: recipient.organizationId ?? null,
    });

    // Gmail SMTP のレート制限対策: 0.2 秒待機
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return result;
}

/**
 * ランダムな仮パスワードを生成
 * 英大文字・英小文字・数字を含む12文字
 */
export function generateTempPassword(length = 12): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Iとo除外
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789'; // 0, 1除外
  const all = upper + lower + digits;

  let pw = '';
  pw += upper[Math.floor(Math.random() * upper.length)];
  pw += lower[Math.floor(Math.random() * lower.length)];
  pw += digits[Math.floor(Math.random() * digits.length)];
  for (let i = 3; i < length; i++) {
    pw += all[Math.floor(Math.random() * all.length)];
  }
  // シャッフル
  return pw.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * インタビューシップ企業担当者向けアカウント発行メールを送信
 * - Supabase招待メールは使わず、Resendで直接送る
 * - ワンタイムトークンが無いので、事前スキャン等でも壊れない
 * - メール送信履歴をDBに記録する
 */
export async function sendInterviewshipAccountEmail(
  params: SendAccountEmailParams
): Promise<SendResult> {
  const {
    email,
    contactName,
    companyName,
    password,
    companyId,
    organizationId,
    programId,
    emailType = 'account_invite',
    sentBy,
  } = params;

  const supabase = createAdminClient();
  const loginUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/login/company`
    : 'https://ehime-base.vercel.app/login/company';

  const isReset = emailType === 'password_reset';
  const subjectPrefix = isReset
    ? '【Ehime Base】パスワード再発行のお知らせ'
    : '【Ehime Base インタビューシップ】アカウント発行のお知らせ';

  const greeting = contactName ? `${contactName} 様` : 'ご担当者様';
  const companyLine = companyName ? `（${companyName}）` : '';

  const introText = isReset
    ? 'パスワードが再発行されました。以下の情報でログインしてください。'
    : 'インタビューシップへのご参加ありがとうございます。以下の情報でログインしてください。';

  const html = `
<!DOCTYPE html>
<html>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif; color: #1e293b; line-height: 1.7; max-width: 600px; margin: 0 auto; padding: 24px;">
    <div style="background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); padding: 24px; border-radius: 16px 16px 0 0; color: white;">
      <div style="font-weight: 900; font-size: 18px; letter-spacing: 0.02em;">EHIME BASE ／ リスキル大学</div>
      <div style="font-size: 14px; opacity: 0.9; margin-top: 4px;">インタビューシップ</div>
    </div>
    <div style="background: white; padding: 32px 24px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none;">
      <p>${greeting}${companyLine}</p>
      <p>${introText}</p>

      <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #e2e8f0;">
        <div style="margin-bottom: 12px;">
          <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">ログインURL</div>
          <div><a href="${loginUrl}" style="color: #2563eb; font-weight: 700; text-decoration: none;">${loginUrl}</a></div>
        </div>
        <div style="margin-bottom: 12px;">
          <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">メールアドレス</div>
          <div style="font-weight: 700;">${email}</div>
        </div>
        <div>
          <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">${isReset ? '新しいパスワード' : '初期パスワード'}</div>
          <div style="font-family: 'SF Mono', Monaco, Menlo, monospace; font-weight: 700; font-size: 16px; background: white; padding: 8px 12px; border-radius: 6px; border: 1px solid #cbd5e1; display: inline-block; margin-top: 4px;">${password}</div>
        </div>
      </div>

      <p style="font-size: 13px; color: #64748b;">
        ※ セキュリティのため、ログイン後すぐにパスワードをお忘れなく変更してください。<br/>
        ※ このメールに心当たりのない方は、お手数ですがこのメールを破棄してください。
      </p>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0 16px;" />
      <p style="font-size: 12px; color: #94a3b8;">
        Ehime Base インタビューシップ事務局<br/>
        このメールは送信専用のため、ご返信いただけません。
      </p>
    </div>
  </body>
</html>
  `.trim();

  const textBody = `${greeting}${companyLine}

${introText}

ログインURL: ${loginUrl}
メールアドレス: ${email}
${isReset ? '新しいパスワード' : '初期パスワード'}: ${password}

※ セキュリティのため、ログイン後すぐにパスワードを変更してください。

---
Ehime Base インタビューシップ事務局`;

  const fromAddress = process.env.RESEND_FROM_EMAIL || 'Ehime Base <onboarding@resend.dev>';

  let sendStatus: 'sent' | 'failed' = 'sent';
  let errorMessage: string | null = null;
  let resendId: string | null = null;

  if (!process.env.RESEND_API_KEY) {
    sendStatus = 'failed';
    errorMessage = 'RESEND_API_KEY is not configured';
  } else {
    try {
      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: [email],
        subject: subjectPrefix,
        html,
        text: textBody,
      });

      if (error) {
        sendStatus = 'failed';
        errorMessage = error.message || String(error);
      } else {
        resendId = (data as any)?.id || null;
      }
    } catch (e: any) {
      sendStatus = 'failed';
      errorMessage = e.message || String(e);
    }
  }

  // メール送信履歴をDBに記録（送信失敗時も記録）
  const { data: logRow } = await supabase
    .from('interviewship_email_logs')
    .insert({
      email_type: emailType,
      to_email: email,
      to_name: contactName || null,
      subject: subjectPrefix,
      body_preview: textBody.slice(0, 500),
      company_id: companyId || null,
      organization_id: organizationId || null,
      program_id: programId || null,
      status: sendStatus,
      error_message: errorMessage,
      resend_id: resendId,
      sent_by: sentBy || null,
    })
    .select()
    .single();

  // 企業テーブルの最終送信日時を更新
  if (companyId && sendStatus === 'sent') {
    await supabase
      .from('interviewship_companies')
      .update({ last_email_sent_at: new Date().toISOString() })
      .eq('id', companyId);
  }

  return {
    email,
    success: sendStatus === 'sent',
    error: errorMessage || undefined,
    logId: logRow?.id,
  };
}

/**
 * Auth.usersに企業担当者を作成 or 既存ユーザーのパスワードを更新
 * 作成後、インタビューシップ企業テーブルとorganization_membersに紐付け
 */
export async function upsertCompanyAccount(params: {
  email: string;
  password: string;
  companyId: string;
  organizationId?: string;
  companyName?: string;
}): Promise<{ userId: string; wasCreated: boolean; error?: string }> {
  const supabase = createAdminClient();

  // 既存ユーザーを探す
  const { data: list } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const existing = list?.users?.find(u => u.email?.toLowerCase() === params.email.toLowerCase());

  let userId: string;
  let wasCreated = false;

  if (existing) {
    userId = existing.id;
    const { error: updErr } = await supabase.auth.admin.updateUserById(existing.id, {
      password: params.password,
      email_confirm: true,
    });
    if (updErr) {
      return { userId, wasCreated: false, error: updErr.message };
    }
  } else {
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: params.email,
      password: params.password,
      email_confirm: true,
      user_metadata: {
        user_type: 'company',
        company_name: params.companyName,
        organization_id: params.organizationId,
      },
    });
    if (createErr || !created?.user) {
      return { userId: '', wasCreated: false, error: createErr?.message || 'Failed to create user' };
    }
    userId = created.user.id;
    wasCreated = true;
  }

  // profilesにupsert
  await supabase.from('profiles').upsert(
    { id: userId, email: params.email, user_type: 'company' },
    { onConflict: 'id' }
  );

  // 企業テーブル更新
  await supabase
    .from('interviewship_companies')
    .update({
      user_id: userId,
      account_created_at: wasCreated ? new Date().toISOString() : undefined,
    })
    .eq('id', params.companyId);

  // organization_members紐付け
  if (params.organizationId) {
    await supabase.from('organization_members').upsert(
      {
        organization_id: params.organizationId,
        user_id: userId,
        role: 'member',
        status: 'active',
      },
      { onConflict: 'organization_id,user_id' }
    );
  }

  return { userId, wasCreated };
}
