export interface Unit {
  id: string;
  title: string;
  order: number;
  materials?: Material[];
}

export interface Material {
  id: string;
  unit_id: string;
  title: string;
  slide_ref: string | null;
  starter_code: string | null;
  order: number;
  questions?: Question[];
}

export interface Question {
  id: string;
  material_id: string;
  type: 'choice' | 'code';
  prompt: string;
  choices: string[] | null;
  correct: number | number[] | null;
  points: number;
  order: number;
}

export interface CodeTest {
  id: string;
  question_id: string;
  input: string;
  expected_output: string;
}

export interface Rank {
  name: string;
  min_xp: number;
}

export interface UserProfile {
  id: string;
  display_name: string;
  role: 'student' | 'teacher' | 'admin';
  xp: number;
  rank: string;
}

export interface AttemptResult {
  attempt_id: string;
  score: number;
  max_score: number;
  passed: boolean;
  xp_earned: number;
  perfect_bonus: number;
}
