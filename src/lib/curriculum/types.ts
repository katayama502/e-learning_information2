// ============================================================
//  カリキュラムの共通型（学習ページ・管理ボード・シードで共有）
// ============================================================

export interface CodeTest {
  input: string;
  expected_output: string;
}

export interface Question {
  id: string;
  type: 'choice' | 'code';
  prompt: string;
  choices?: string[];
  correct?: number;
  points: number;
  code_tests?: CodeTest[];
}

export interface Material {
  id: string;
  title: string;
  slide_ref: string | null;
  starter_code: string;
  questions: Question[];
  unitId?: string; // Firestore上で所属するユニット
  order?: number; // 表示順
}

export interface Unit {
  id: string;
  title: string;
  order?: number;
  materials: Material[];
}
