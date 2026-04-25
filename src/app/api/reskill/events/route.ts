import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('reskill_events')
            .select('*')
            .order('start_at', { ascending: true });

        if (error) {
            // テーブルが存在しない場合は空配列を返す
            return NextResponse.json([]);
        }

        return NextResponse.json(data || []);
    } catch {
        return NextResponse.json([]);
    }
}
