"use client";

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function TrialLimitBanner() {
  const [needsFullRegistration, setNeedsFullRegistration] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('sns_profiles')
        .select('membership_status')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.membership_status === '体験') {
        const { count } = await supabase
          .from('reskill_event_applications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('attended', true);

        if ((count ?? 0) >= 1) {
          setNeedsFullRegistration(true);
        }
      }

      setIsLoading(false);
    };
    check();
  }, []);

  if (isLoading || !needsFullRegistration) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-bold text-amber-800">体験参加の上限に達しました</p>
          <p className="text-xs text-amber-600 mt-1">
            続けてイベントに参加するには、本登録が必要です。
          </p>
          <Link
            href="/register/full"
            className="inline-flex items-center gap-1 mt-3 px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-colors"
          >
            本登録する <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
