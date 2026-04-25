interface KeywordEntry {
  eventId: number;
  name: string;
}

/**
 * インタビューシップキーワード → イベントIDマッピング
 *
 * 学生がキーワードを入力すると該当のイベントページに遷移する。
 * 新規イベント追加時はここにエントリを追加すること。
 */
export const INTERVIEWSHIP_KEYWORDS: Record<string, KeywordEntry> = {
  '2026hojo': { eventId: 10, name: '2026北条高校インタビューシップ' },
  '2025matsukita': { eventId: 9, name: '2025松山北高校インタビューシップ' },
  '2025touon': { eventId: 8, name: '2025東温高校インタビューシップ' },
  '2025shakyoso': { eventId: 7, name: '2025社会共創学部インタビューシップ' },
  '2025natsukigyo': { eventId: 5, name: '2025夏休み企業参観日' },
  '2025kawahara': { eventId: 4, name: '2025河原学園合同企業説明会' },
  '2025uwajimaminami': { eventId: 3, name: '2025宇和島南高校インタビューシップ' },
  '2025kawanoishi': { eventId: 2, name: '2025川之石高校インタビューシップ' },
  '2025hellowork': { eventId: 1, name: '2025ハローワーク' },
};

/**
 * 管理者用キーワード
 * このキーワードを入力すると従来の一覧ページにアクセスできる
 */
export const ADMIN_KEYWORD = 'eis-admin-2026';
