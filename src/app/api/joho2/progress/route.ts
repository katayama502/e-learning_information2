export const dynamic = 'force-dynamic';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { materialId } = await req.json();
  if (!materialId) return NextResponse.json({ error: 'materialId required' }, { status: 400 });

  const admin = createAdminClient();
  const XP_SLIDE = 10;

  // Idempotent insert: unique index on (user_id, material_id) WHERE reason = 'slide_read'
  const { error } = await admin.from('xp_log').insert({
    user_id: user.id,
    material_id: materialId,
    delta: XP_SLIDE,
    reason: 'slide_read',
  });

  if (error) {
    // Unique constraint violation = already recorded, that's fine
    if (error.code === '23505') return NextResponse.json({ xp_earned: 0, already_read: true });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update profile xp (manual update)
  const { data: profile } = await admin.from('profiles').select('xp').eq('id', user.id).maybeSingle();
  if (profile !== null) {
    const newXp = (profile?.xp ?? 0) + XP_SLIDE;
    await admin.from('profiles').update({ xp: newXp, rank: xpToRank(newXp) }).eq('id', user.id);
  }

  return NextResponse.json({ xp_earned: XP_SLIDE });
}

function xpToRank(xp: number): string {
  if (xp >= 6000) return 'マスター';
  if (xp >= 3000) return 'プラチナ';
  if (xp >= 1500) return 'ゴールド';
  if (xp >= 700) return 'シルバー';
  if (xp >= 300) return 'ブロンズ';
  if (xp >= 100) return 'ルーキー';
  return 'ビギナー';
}
