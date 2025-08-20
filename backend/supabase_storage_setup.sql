-- Supabase Storage設定SQL
-- Storageタブで手動で作成するか、以下のSQLを実行

-- 1. バケット作成
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('images', 'images', true),
  ('documents', 'documents', false);

-- 2. Storage ポリシーの設定

-- 画像バケット（パブリック読み取り、認証ユーザーのみ書き込み）
CREATE POLICY "Public read access for images" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ドキュメントバケット（認証ユーザーのみアクセス）
CREATE POLICY "Authenticated users can read documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can upload documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);