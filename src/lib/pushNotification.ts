import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// Lazy init to avoid build-time errors
let _vapidSet = false;
function ensureVapid() {
  if (!_vapidSet && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      'mailto:info@ehime-base.jp',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    _vapidSet = true;
  }
}

export async function sendPushToUser(userId: string, payload: {
  title: string;
  body: string;
  url?: string;
}) {
  ensureVapid();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', userId);

  if (!subscriptions || subscriptions.length === 0) return;

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify(payload)
      ).catch(async (err) => {
        // Remove expired subscriptions
        if (err.statusCode === 410 || err.statusCode === 404) {
          await supabase.from('push_subscriptions')
            .delete()
            .eq('endpoint', sub.endpoint);
        }
        throw err;
      })
    )
  );

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  return { sent, total: subscriptions.length };
}

export async function sendPushToUsers(userIds: string[], payload: {
  title: string;
  body: string;
  url?: string;
}) {
  const results = await Promise.allSettled(
    userIds.map((uid) => sendPushToUser(uid, payload))
  );
  return results;
}
