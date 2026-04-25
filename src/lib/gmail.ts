import * as nodemailer from 'nodemailer';

const GMAIL_USER = process.env.GMAIL_USER || 'y.nishimura@eis-reach.com';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || '';

let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
    if (!_transporter) {
        if (!GMAIL_APP_PASSWORD) {
            throw new Error('GMAIL_APP_PASSWORD が設定されていません');
        }
        _transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
        });
    }
    return _transporter;
}

export interface GmailAttachment {
    filename: string;
    content: string | Buffer;
    contentType?: string;
}

/** Gmail SMTP 経由で送信。差出人表示名と Reply-To、添付は呼び出し元でカスタマイズ可能。 */
export async function sendGmailEmail(params: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    /** From の表示名。指定なしは「リスキル大学運営事務局」 */
    fromDisplayName?: string;
    /** Reply-To。指定なしは GMAIL_USER */
    replyTo?: string;
    /** 添付ファイル */
    attachments?: GmailAttachment[];
    /** cc */
    cc?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
        const fromName = params.fromDisplayName ?? 'リスキル大学運営事務局';
        const info = await getTransporter().sendMail({
            from: `"${fromName}" <${GMAIL_USER}>`,
            to: params.to,
            cc: params.cc,
            subject: params.subject,
            html: params.html,
            text: params.text,
            replyTo: params.replyTo ?? GMAIL_USER,
            attachments: params.attachments,
        });
        return { success: true, messageId: info.messageId };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return { success: false, error: message };
    }
}
