import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

const RANKS = [
  { name: 'ビギナー', min_xp: 0 },
  { name: 'ルーキー', min_xp: 100 },
  { name: 'ブロンズ', min_xp: 300 },
  { name: 'シルバー', min_xp: 700 },
  { name: 'ゴールド', min_xp: 1500 },
  { name: 'プラチナ', min_xp: 3000 },
  { name: 'マスター', min_xp: 6000 },
];

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, xp, rank')
    .eq('id', user.id)
    .maybeSingle();

  const xp = profile?.xp ?? 0;
  const currentRankIdx = RANKS.reduce((idx, r, i) => (xp >= r.min_xp ? i : idx), 0);
  const nextRank = RANKS[currentRankIdx + 1] ?? null;

  const { data: recentAttempts } = await supabase
    .from('attempts')
    .select('id, material_id, score, passed, created_at, materials(title)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  return NextResponse.json({
    profile: { ...profile, xp },
    ranks: RANKS,
    next_rank: nextRank,
    recent_attempts: recentAttempts ?? [],
  });
}
