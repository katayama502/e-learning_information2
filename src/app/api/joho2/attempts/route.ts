export const dynamic = 'force-dynamic';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';

const XP_PASS = 50;
const XP_PERFECT_BONUS = 20;

function xpToRank(xp: number): string {
  if (xp >= 6000) return 'マスター';
  if (xp >= 3000) return 'プラチナ';
  if (xp >= 1500) return 'ゴールド';
  if (xp >= 700) return 'シルバー';
  if (xp >= 300) return 'ブロンズ';
  if (xp >= 100) return 'ルーキー';
  return 'ビギナー';
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { materialId, answers } = await req.json();
  if (!materialId || !Array.isArray(answers)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Fetch questions + code_tests using service role (includes correct answers)
  const { data: questions, error: qErr } = await admin
    .from('questions')
    .select('id, type, correct, points, code_tests(id, input, expected_output)')
    .eq('material_id', materialId);

  if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });

  let score = 0;
  let maxScore = 0;
  const answerRows: { attempt_id?: string; question_id: string; user_answer: unknown; is_correct: boolean }[] = [];

  for (const q of questions ?? []) {
    maxScore += q.points;
    const userAns = answers.find((a: { question_id: string }) => a.question_id === q.id);
    if (!userAns) { answerRows.push({ question_id: q.id, user_answer: null, is_correct: false }); continue; }

    let isCorrect = false;
    if (q.type === 'choice') {
      isCorrect = userAns.user_answer === q.correct ||
        (Array.isArray(q.correct) && q.correct.includes(userAns.user_answer));
    } else if (q.type === 'code') {
      // Client ran Pyodide and sent stdout; server verifies against expected_output
      const tests = (q as { code_tests: { expected_output: string }[] }).code_tests ?? [];
      if (tests.length === 0) {
        isCorrect = true; // No tests = free pass
      } else {
        const output = String(userAns.user_answer ?? '').trim();
        isCorrect = tests.some((t) => t.expected_output.trim() === output);
      }
    }

    if (isCorrect) score += q.points;
    answerRows.push({ question_id: q.id, user_answer: userAns.user_answer, is_correct: isCorrect });
  }

  const passed = maxScore > 0 ? score / maxScore >= 0.6 : true;

  // Insert attempt
  const { data: attempt, error: aErr } = await admin
    .from('attempts')
    .insert({ user_id: user.id, material_id: materialId, score, passed })
    .select('id')
    .single();
  if (aErr) return NextResponse.json({ error: aErr.message }, { status: 500 });

  // Insert answers
  await admin.from('answers').insert(answerRows.map((a) => ({ ...a, attempt_id: attempt.id })));

  // XP award
  let xpEarned = 0;
  let perfectBonus = 0;
  if (passed) {
    xpEarned = XP_PASS;
    if (score === maxScore) perfectBonus = XP_PERFECT_BONUS;
    const total = xpEarned + perfectBonus;

    await admin.from('xp_log').insert({
      user_id: user.id,
      material_id: materialId,
      delta: total,
      reason: 'quiz_pass',
    });

    const { data: profile } = await admin.from('profiles').select('xp').eq('id', user.id).maybeSingle();
    const newXp = (profile?.xp ?? 0) + total;
    await admin.from('profiles').update({ xp: newXp, rank: xpToRank(newXp) }).eq('id', user.id);
  }

  return NextResponse.json({
    attempt_id: attempt.id,
    score,
    max_score: maxScore,
    passed,
    xp_earned: xpEarned,
    perfect_bonus: perfectBonus,
  });
}
