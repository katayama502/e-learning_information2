import { Resend } from 'resend';

// Lazy init to avoid build-time errors when env var is not available
let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY || '');
  }
  return _resend;
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@ehime-base.jp';
const FROM_NAME = 'Ehime Base';

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  try {
    const { data, error } = await getResend().emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });

    if (error) {
      console.error('Email send error:', error);
      return null;
    }
    return data;
  } catch (e) {
    console.error('Email send failed:', e);
    return null;
  }
}

// Event reminder email template
export function eventReminderEmailHtml(params: {
  userName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  meetUrl?: string;
  eventUrl: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #3b82f6, #6366f1); padding: 30px; border-radius: 16px; color: white; text-align: center; margin-bottom: 20px;">
    <h1 style="margin: 0; font-size: 20px;">📅 イベントのお知らせ</h1>
  </div>
  <div style="background: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
    <p style="color: #475569; margin-top: 0;">${params.userName}さん</p>
    <h2 style="color: #1e293b; margin: 16px 0 8px;">${params.eventTitle}</h2>
    <p style="color: #64748b;">📅 ${params.eventDate} ${params.eventTime}〜</p>
    ${params.meetUrl ? `
    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="color: #475569; margin: 0 0 8px; font-size: 12px; font-weight: bold;">参加URL</p>
      <a href="${params.meetUrl}" style="color: #3b82f6; font-weight: bold; word-break: break-all;">${params.meetUrl}</a>
    </div>
    ` : ''}
    <a href="${params.eventUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
      イベント詳細を見る →
    </a>
  </div>
  <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">
    Ehime Base - 愛媛のキャリアと学びのプラットフォーム
  </p>
</body>
</html>`;
}

// Event application confirmation email
export function eventApplicationEmailHtml(params: {
  userName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  meetUrl?: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 16px; color: white; text-align: center; margin-bottom: 20px;">
    <h1 style="margin: 0; font-size: 20px;">✅ お申し込み完了</h1>
  </div>
  <div style="background: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
    <p style="color: #475569; margin-top: 0;">${params.userName}さん、お申し込みありがとうございます！</p>
    <h2 style="color: #1e293b; margin: 16px 0 8px;">${params.eventTitle}</h2>
    <p style="color: #64748b;">📅 ${params.eventDate} ${params.eventTime}〜</p>
    ${params.meetUrl ? `
    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="color: #475569; margin: 0 0 8px; font-size: 12px; font-weight: bold;">参加URL（当日こちらからご参加ください）</p>
      <a href="${params.meetUrl}" style="color: #3b82f6; font-weight: bold; word-break: break-all;">${params.meetUrl}</a>
    </div>
    ` : ''}
  </div>
  <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">
    Ehime Base - 愛媛のキャリアと学びのプラットフォーム
  </p>
</body>
</html>`;
}

// Auth link email template (パスワード設定用)
export function authLinkEmailHtml(params: {
  userName: string;
  authLink: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ehime-base-app.vercel.app';
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, 'Hiragino Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #334155;">
  <div style="background: linear-gradient(135deg, #3b82f6, #6366f1); padding: 30px; border-radius: 16px; color: white; text-align: center; margin-bottom: 24px;">
    <h1 style="margin: 0; font-size: 20px; font-weight: 900;">EHIME BASE パスワード設定</h1>
    <p style="margin: 8px 0 0; font-size: 13px; opacity: 0.9;">リスキル大学運営事務局</p>
  </div>
  <div style="background: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0; line-height: 1.8;">
    <p>${params.userName}さん</p>
    <p>EHIME BASE（新e-ラーニングシステム）をご利用いただくために、<br>以下のボタンからパスワードの設定をお願いいたします。</p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${params.authLink}" style="display: inline-block; background: #3b82f6; color: white; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
        パスワードを設定する
      </a>
    </div>
    <p style="font-size: 13px; color: #64748b;">
      ※このリンクは24時間有効です。<br>
      ※ボタンが押せない場合は、以下のURLをブラウザに直接貼り付けてください。<br>
      <a href="${params.authLink}" style="color: #3b82f6; word-break: break-all; font-size: 12px;">${params.authLink}</a>
    </p>
  </div>
  <div style="border-top: 2px solid #e2e8f0; padding-top: 20px; margin-top: 24px; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.8;">
    <p style="margin: 0; font-weight: bold; color: #64748b;">リスキル大学運営事務局</p>
    <p style="margin: 8px 0 0;">
      <a href="${appUrl}" style="color: #3b82f6; text-decoration: none;">EHIME BASE</a>　|
      <a href="https://reskill-college.com/" style="color: #3b82f6; text-decoration: none;">リスキル大学HP</a>
    </p>
  </div>
</body>
</html>`;
}
