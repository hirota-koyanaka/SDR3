-- ========================================
-- Row Level Security (RLS) ポリシー設定
-- ========================================
-- Supabase Project: hoechpkznbpavyozjqni
-- 
-- このファイルは database_schema.sql の実行後に実行してください
-- データのセキュリティを確保するためのアクセス制御設定です
-- ========================================

-- ========================================
-- RLSを有効化
-- ========================================

-- 全テーブルでRLSを有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccination_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 管理者権限チェック関数
-- ========================================

-- 管理者かどうかをチェックする関数
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM admin_users 
    WHERE auth_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 特定のユーザーが管理者かチェック
CREATE OR REPLACE FUNCTION is_admin_user(user_auth_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM admin_users 
    WHERE auth_id = user_auth_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 1. ユーザーテーブルのポリシー
-- ========================================

-- ユーザーは自分の情報のみ参照可能
CREATE POLICY "Users can view own data" ON users
FOR SELECT USING (auth_id = auth.uid());

-- 管理者は全ユーザー情報を参照可能
CREATE POLICY "Admins can view all users" ON users
FOR SELECT USING (is_admin());

-- ユーザーは自分の情報のみ更新可能
CREATE POLICY "Users can update own data" ON users
FOR UPDATE USING (auth_id = auth.uid());

-- 管理者は全ユーザー情報を更新可能
CREATE POLICY "Admins can update all users" ON users
FOR UPDATE USING (is_admin());

-- 管理者のみユーザーを削除可能
CREATE POLICY "Admins can delete users" ON users
FOR DELETE USING (is_admin());

-- ========================================
-- 2. 管理者テーブルのポリシー
-- ========================================

-- 管理者は全管理者情報を参照可能
CREATE POLICY "Admins can view all admin users" ON admin_users
FOR SELECT USING (is_admin());

-- スーパー管理者のみ管理者情報を更新可能
CREATE POLICY "Super admins can manage admin users" ON admin_users
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE auth_id = auth.uid() AND role = 'super_admin'
  )
);

-- ========================================
-- 3. 犬テーブルのポリシー
-- ========================================

-- ユーザーは自分の犬情報のみ参照可能
CREATE POLICY "Users can view own dogs" ON dogs
FOR SELECT USING (
  user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  )
);

-- 管理者は全犬情報を参照可能
CREATE POLICY "Admins can view all dogs" ON dogs
FOR SELECT USING (is_admin());

-- ユーザーは自分の犬情報のみ更新・削除可能
CREATE POLICY "Users can manage own dogs" ON dogs
FOR ALL USING (
  user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  )
);

-- 管理者は全犬情報を管理可能
CREATE POLICY "Admins can manage all dogs" ON dogs
FOR ALL USING (is_admin());

-- ========================================
-- 4. 申請テーブルのポリシー
-- ========================================

-- 誰でも申請を作成可能（新規登録時）
CREATE POLICY "Anyone can create applications" ON applications
FOR INSERT WITH CHECK (true);

-- 管理者のみ申請を参照・更新可能
CREATE POLICY "Admins can manage applications" ON applications
FOR ALL USING (is_admin());

-- ========================================
-- 5. 申請犬情報テーブルのポリシー
-- ========================================

-- 申請作成者が申請犬情報を作成可能
CREATE POLICY "Anyone can create application dogs" ON application_dogs
FOR INSERT WITH CHECK (true);

-- 管理者のみ申請犬情報を管理可能
CREATE POLICY "Admins can manage application dogs" ON application_dogs
FOR ALL USING (is_admin());

-- ========================================
-- 6. ワクチン証明書テーブルのポリシー
-- ========================================

-- 申請作成者がワクチン証明書を作成可能
CREATE POLICY "Anyone can upload vaccination certificates" ON vaccination_certificates
FOR INSERT WITH CHECK (true);

-- 管理者のみワクチン証明書を管理可能
CREATE POLICY "Admins can manage vaccination certificates" ON vaccination_certificates
FOR ALL USING (is_admin());

-- ========================================
-- 7. イベントテーブルのポリシー
-- ========================================

-- 全ユーザーがイベントを参照可能（承認済みのみ）
CREATE POLICY "Users can view published events" ON events
FOR SELECT USING (status != 'cancelled');

-- 管理者のみイベントを作成・更新・削除可能
CREATE POLICY "Admins can manage events" ON events
FOR ALL USING (is_admin());

-- ========================================
-- 8. イベント参加者テーブルのポリシー
-- ========================================

-- ユーザーは自分の参加情報のみ参照可能
CREATE POLICY "Users can view own event participation" ON event_participants
FOR SELECT USING (
  user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  )
);

-- ユーザーは自分の参加情報を作成・削除可能
CREATE POLICY "Users can manage own event participation" ON event_participants
FOR INSERT WITH CHECK (
  user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own event participation" ON event_participants
FOR DELETE USING (
  user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  )
);

-- 管理者は全参加情報を管理可能
CREATE POLICY "Admins can manage all event participants" ON event_participants
FOR ALL USING (is_admin());

-- ========================================
-- 9. 投稿テーブルのポリシー
-- ========================================

-- ユーザーは承認済み投稿を参照可能
CREATE POLICY "Users can view approved posts" ON posts
FOR SELECT USING (status = 'approved');

-- ユーザーは自分の投稿のみ参照可能（全ステータス）
CREATE POLICY "Users can view own posts" ON posts
FOR SELECT USING (
  user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  )
);

-- ユーザーは投稿を作成可能
CREATE POLICY "Users can create posts" ON posts
FOR INSERT WITH CHECK (
  user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  )
);

-- ユーザーは自分の投稿のみ更新・削除可能
CREATE POLICY "Users can update own posts" ON posts
FOR UPDATE USING (
  user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own posts" ON posts
FOR DELETE USING (
  user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  )
);

-- 管理者は全投稿を管理可能
CREATE POLICY "Admins can manage all posts" ON posts
FOR ALL USING (is_admin());

-- ========================================
-- 10. 投稿通報テーブルのポリシー
-- ========================================

-- ユーザーは通報を作成可能
CREATE POLICY "Users can create post reports" ON post_reports
FOR INSERT WITH CHECK (
  user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  )
);

-- 管理者のみ通報を参照・管理可能
CREATE POLICY "Admins can manage post reports" ON post_reports
FOR ALL USING (is_admin());

-- ========================================
-- 11. 入退場ログテーブルのポリシー
-- ========================================

-- ユーザーは自分の入退場ログのみ参照可能
CREATE POLICY "Users can view own entry logs" ON entry_logs
FOR SELECT USING (
  user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  )
);

-- 管理者は全入退場ログを管理可能
CREATE POLICY "Admins can manage all entry logs" ON entry_logs
FOR ALL USING (is_admin());

-- QRコード読み取り用（管理者のみ）
CREATE POLICY "Admins can create entry logs" ON entry_logs
FOR INSERT WITH CHECK (is_admin());

-- ========================================
-- 12. お知らせテーブルのポリシー
-- ========================================

-- 全ユーザーが公開お知らせを参照可能
CREATE POLICY "Users can view published announcements" ON announcements
FOR SELECT USING (is_published = true);

-- 管理者のみお知らせを管理可能
CREATE POLICY "Admins can manage announcements" ON announcements
FOR ALL USING (is_admin());

-- ========================================
-- 13. 営業時間テーブルのポリシー
-- ========================================

-- 全ユーザーが営業時間を参照可能
CREATE POLICY "Anyone can view business hours" ON business_hours
FOR SELECT USING (true);

-- 管理者のみ営業時間を更新可能
CREATE POLICY "Admins can manage business hours" ON business_hours
FOR ALL USING (is_admin());

-- ========================================
-- 14. 特別休業日テーブルのポリシー
-- ========================================

-- 全ユーザーが特別休業日を参照可能
CREATE POLICY "Anyone can view special holidays" ON special_holidays
FOR SELECT USING (true);

-- 管理者のみ特別休業日を管理可能
CREATE POLICY "Admins can manage special holidays" ON special_holidays
FOR ALL USING (is_admin());

-- ========================================
-- 15. システム設定テーブルのポリシー
-- ========================================

-- 全ユーザーが一部のシステム設定を参照可能（公開設定のみ）
CREATE POLICY "Users can view public system config" ON system_config
FOR SELECT USING (
  config_key IN (
    'site_title', 
    'max_dogs_per_user', 
    'require_vaccination',
    'allow_guest_viewing',
    'enable_sns_features',
    'enable_event_registration',
    'maintenance_mode',
    'contact_email'
  )
);

-- 管理者は全システム設定を管理可能
CREATE POLICY "Admins can manage system config" ON system_config
FOR ALL USING (is_admin());

-- ========================================
-- ビューの作成（便利な参照用）
-- ========================================

-- 現在入場中のユーザービュー
CREATE OR REPLACE VIEW current_visitors AS
SELECT 
  el.id,
  el.user_id,
  u.name,
  u.email,
  el.entry_time,
  COUNT(d.id) as dog_count
FROM entry_logs el
JOIN users u ON el.user_id = u.id
LEFT JOIN dogs d ON d.user_id = u.id
WHERE el.exit_time IS NULL
GROUP BY el.id, el.user_id, u.name, u.email, el.entry_time
ORDER BY el.entry_time DESC;

-- 承認待ち申請数ビュー
CREATE OR REPLACE VIEW pending_applications_count AS
SELECT COUNT(*) as count
FROM applications
WHERE status = 'pending';

-- 今後のイベント数ビュー
CREATE OR REPLACE VIEW upcoming_events_count AS
SELECT COUNT(*) as count
FROM events
WHERE event_date >= CURRENT_DATE AND status = 'upcoming';

-- ユーザー数ビュー
CREATE OR REPLACE VIEW total_users_count AS
SELECT COUNT(*) as count
FROM users
WHERE status = 'active';

-- ========================================
-- 完了メッセージ
-- ========================================
-- Row Level Security ポリシーの設定が完了しました
-- 次のステップ: 初期管理者アカウントの作成