export const REFERRAL_SOURCES = [
  '知人・友人の紹介経路',
  'ソーシャルメディア経由',
  '広告',
  'その他',
] as const;

export type ReferralSource = (typeof REFERRAL_SOURCES)[number];

export const ENROLLMENT_PURPOSES = [
  'スキルアップがしたいから',
  '人脈を広げたい',
  '自分のビジネスを広げたい',
  '転職のため',
  'キャリアアップのため',
  '成長したい',
  '新しいことに挑戦したい',
  'やりたいことを見つけたい',
  '誰かのサポートがしたい',
  '夢の実現',
  '社会復帰のため',
  '会社の研修として',
] as const;

export type EnrollmentPurpose = (typeof ENROLLMENT_PURPOSES)[number];

export const INTEREST_FIELDS = [
  'IT・DX推進',
  '金融・ファイナンス',
  'マインドセット・哲学・自己分析',
  'ビジネス・マーケティング',
  'コミュニケーション',
  '美容・健康',
  '子育て・教育',
  '動画・映像',
  'デザイン・クリエイティブ',
  '歴史',
  'その他',
] as const;

export type InterestField = (typeof INTEREST_FIELDS)[number];

export const MEMBERSHIP_STATUSES = ['体験', '受講生', '卒業生', '休学中'] as const;

export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];
