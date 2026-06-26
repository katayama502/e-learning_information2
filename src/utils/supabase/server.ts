// Supabase server client — env vars がない場合はダミーを返す
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // env vars がない場合はダミークライアント（ビルドエラー防止）
    if (!url || !key) {
        return {
            auth: {
                getUser: async () => ({ data: { user: null }, error: null }),
                getSession: async () => ({ data: { session: null }, error: null }),
            },
            from: () => ({
                select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }), data: null, error: null }), data: null, error: null }),
                insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }), data: null, error: null }),
                update: () => ({ eq: () => ({ data: null, error: null }) }),
                delete: () => ({ eq: () => ({ data: null, error: null }) }),
                upsert: () => ({ data: null, error: null }),
            }),
            rpc: () => ({ data: null, error: null }),
        } as unknown as ReturnType<typeof createServerClient>;
    }

    const cookieStore = await cookies();
    return createServerClient(url, key, {
        cookies: {
            getAll() { return cookieStore.getAll(); },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                } catch { /* Server Component では無視 */ }
            },
        },
    });
}
