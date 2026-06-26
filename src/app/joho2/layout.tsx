// 認証不要 — ローカルストレージで進捗管理するためガードなし
export default function Joho2Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
