'use client';

// 学習ページは「管理者が登録した有効ユーザー」のみアクセス可能。
// 認証ガードを通過したユーザーに対して、カリキュラムと進捗を配布する。
import { RequireAuth } from '@/components/auth/RequireAuth';
import { CurriculumProvider } from '@/lib/curriculum/CurriculumProvider';
import { ProgressProvider } from '@/lib/progress/ProgressProvider';

export default function Joho2Layout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <CurriculumProvider>
        <ProgressProvider>{children}</ProgressProvider>
      </CurriculumProvider>
    </RequireAuth>
  );
}
