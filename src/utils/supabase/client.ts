import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    // Reset cached client if it was built with placeholder values
    if (client && url && key) return client;
    client = createBrowserClient(
        url ?? 'https://placeholder.supabase.co',
        key ?? 'placeholder-key'
    );
    return client;
}
