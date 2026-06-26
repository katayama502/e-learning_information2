export const dynamic = 'force-dynamic';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { data: material, error } = await supabase
    .from('materials')
    .select('id, title, slide_ref, starter_code, unit_id, order, questions(id, type, prompt, choices, points, order)')
    .eq('id', id)
    .order('order', { referencedTable: 'questions' })
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!material) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Check if user has already read the slide
  const { data: slideRead } = await supabase
    .from('xp_log')
    .select('id')
    .eq('user_id', user.id)
    .eq('material_id', id)
    .eq('reason', 'slide_read')
    .maybeSingle();

  return NextResponse.json({ ...material, slide_read: !!slideRead });
}
