-- messages テーブルの Realtime を有効化
begin;
  -- supabase_realtime パブリケーションが存在することを確認し、なければ作成（通常は存在します）
  -- 既に存在する場合のエラーを防ぐため、直接実行せず安全にテーブルを追加します
  alter publication supabase_realtime add table messages;
commit;
