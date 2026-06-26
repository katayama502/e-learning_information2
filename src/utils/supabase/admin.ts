// Supabase admin client — env vars がない場合はダミーを返す
import { createClient as _createClient } from '@supabase/supabase-js'

export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        return {
            auth: { getUser: async () => ({ data: { user: null }, error: null }) },
            from: () => ({
                select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }), single: async () => ({ data: null, error: null }) }), data: null, error: null }),
                insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }), data: null, error: null }),
                update: () => ({ eq: () => ({ data: null, error: null }) }),
                delete: () => ({ eq: () => ({ data: null, error: null }) }),
                upsert: () => ({ data: null, error: null }),
            }),
            rpc: () => ({ data: null, error: null }),
        } as unknown as ReturnType<typeof _createClient>;
    }

    return _createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}
