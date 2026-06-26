'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function Joho2Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then((res: { data: { user: unknown } }) => {
      if (!res.data.user) router.push('/login');
    });
  }, [router, supabase.auth]);

  return <>{children}</>;
}
