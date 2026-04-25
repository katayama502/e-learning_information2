import { sendGmailEmail } from './gmail';

export interface RosterMailParams {
  to: string;
  cc?: string[];
  recipientName: string;          // 例: 富岡 様
  clientName: string;             // 例: 有限会社 オフィス・マリ
  jobTitle: string;               // 例: 4月16日(木)、19日(日)通行量調査
  rosterHtml: string;             // 就労者名簿の HTML（Excel 互換）
  rosterFileName?: string;        // 添付ファイル名（既定: 就労者名簿.xls）
  senderName?: string;            // 例: 舟戸妃呂子
  senderEmail?: string;           // Reply-To
}

/**
 * 就労者名簿を添付してクライアントへ送信する。
 * 既存テンプレ文（オフィスマリ・同友会向け）を踏襲。
 */
export async function sendRosterEmail(params: RosterMailParams) {
  const {
    to,
    cc = [],
    recipientName,
    clientName,
    jobTitle,
    rosterHtml,
    rosterFileName = '就労者名簿.xls',
    senderName = '合同会社EIS 担当者',
    senderEmail,
  } = params;

  const subject = `${clientName} ${jobTitle} 就労者名簿送付`;

  const greeting = `${recipientName}\n\nいつもお世話になっております。\n合同会社EISの${senderName}です。\n\n${jobTitle}の就労者が確定いたしましたので、就労者名簿を送付いたします。\n\n今月もどうぞよろしくお願いいたします。`;

  const signature = `========================\n合同会社 EIS\u3000\n${senderName}${senderEmail ? `\n${senderEmail}` : ''}`;

  const text = `${greeting}\n\n${signature}`;
  const html = `<div style="font-family: 'Hiragino Kaku Gothic Pro', 'Meiryo', sans-serif; line-height:1.7;">
    <p>${escapeHtml(recipientName)}</p>
    <p>いつもお世話になっております。<br>合同会社EISの${escapeHtml(senderName)}です。</p>
    <p>${escapeHtml(jobTitle)}の就労者が確定いたしましたので、<br>就労者名簿を送付いたします。</p>
    <p>今月もどうぞよろしくお願いいたします。</p>
    <p style="color:#888; font-size:12px; margin-top:32px;">
      ========================<br>
      合同会社 EIS<br>
      ${escapeHtml(senderName)}${senderEmail ? `<br>${escapeHtml(senderEmail)}` : ''}
    </p>
  </div>`;

  return sendGmailEmail({
    to,
    cc: cc.length > 0 ? cc.join(',') : undefined,
    subject,
    html,
    text,
    fromDisplayName: '合同会社EIS',
    replyTo: senderEmail,
    attachments: [
      {
        filename: rosterFileName,
        content: rosterHtml,
        contentType: 'application/vnd.ms-excel',
      },
    ],
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
