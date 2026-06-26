import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: units, error } = await supabase
    .from('units')
    .select('id, title, order, materials(id, title, order, slide_ref, starter_code)')
    .order('order')
    .order('order', { referencedTable: 'materials' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(units ?? []);
}
